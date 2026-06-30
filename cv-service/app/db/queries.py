import os
import psycopg2
import logging
import numpy as np

logger = logging.getLogger("cv_service.db")
logger.setLevel(logging.INFO)

class DatabaseQueries:
    def __init__(self):
        # Database URL from environment configuration
        self.db_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL") or "postgresql://postgres:your_password_here@localhost:5433/planogram_compliance"

    def _get_connection(self):
        return psycopg2.connect(self.db_url)

    def _parse_embedding(self, val):
        if val is None:
            return None
        
        # 1. If it's already a list or a tuple, cast all elements to float
        if isinstance(val, (list, tuple)):
            return [float(x) for x in val]
            
        # 2. If it's a string, strip the brackets and split by comma
        if isinstance(val, str):
            cleaned = val.strip('[]')
            if not cleaned:
                return []
            return [float(x) for x in cleaned.split(',')]
            
        # 3. If it's a memoryview, parse via numpy frombuffer
        if isinstance(val, memoryview):
            try:
                # Try float32 first
                return np.frombuffer(val, dtype=np.float32).tolist()
            except Exception:
                try:
                    # Fallback to float64
                    return np.frombuffer(val, dtype=np.float64).tolist()
                except Exception:
                    return [float(x) for x in list(val)]
                    
        # 4. General fallback
        try:
            return [float(x) for x in list(val)]
        except Exception:
            logger.warning(f"Could not parse database embedding of type {type(val)}")
            return None

    def fetch_planogram_cells(self, planogram_id: str):
        logger.info(f"Connecting to database to fetch planogram cells for planogram: {planogram_id}")
        query_str = """
            SELECT c.row, c.position, c.reference_product_id, c.facing_count, r.embedding, r.name, r.sku_code
            FROM planogram_cells c
            JOIN reference_products r ON c.reference_product_id = r.id
            WHERE c.planogram_id = %s
            ORDER BY c.row ASC, c.position ASC
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute(query_str, (planogram_id,))
                rows = cur.fetchall()
                
                cells = []
                for row_data in rows:
                    row_num, position, product_id, facing_count, embedding_raw, product_name, sku_code = row_data
                    
                    embedding = self._parse_embedding(embedding_raw)
                    
                    cells.append({
                        "row": row_num,
                        "position": position,
                        "reference_product_id": product_id,
                        "facing_count": facing_count,
                        "embedding": embedding,
                        "product_name": product_name,
                        "sku_code": sku_code
                    })
                
                logger.info(f"Successfully fetched {len(cells)} expected cell configurations from DB.")
                return cells
        except Exception as e:
            logger.error(f"Error fetching planogram cells: {str(e)}")
            raise e
        finally:
            if conn:
                conn.close()

    def fetch_planogram_client_id(self, planogram_id: str) -> str:
        logger.info(f"Fetching client_id for planogram: {planogram_id}")
        query_str = """
            SELECT st.client_id
            FROM planograms p
            JOIN sections sec ON p.section_id = sec.id
            JOIN stores st ON sec.store_id = st.id
            WHERE p.id = %s
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute(query_str, (planogram_id,))
                row = cur.fetchone()
                if not row:
                    raise ValueError(f"Planogram {planogram_id} not found or has no associated client")
                return str(row[0])
        except Exception as e:
            logger.error(f"Error fetching client_id for planogram {planogram_id}: {str(e)}")
            raise e
        finally:
            if conn:
                conn.close()

    def fetch_all_reference_products(self, client_id: str) -> list:
        logger.info(f"Fetching all reference products for client: {client_id}")
        query_str = """
            SELECT id, name, sku_code, embedding
            FROM reference_products
            WHERE client_id = %s AND embedding_status = 'complete'
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute(query_str, (client_id,))
                rows = cur.fetchall()

                products = []
                for row_data in rows:
                    product_id, name, sku_code, embedding_raw = row_data
                    embedding = self._parse_embedding(embedding_raw)
                    if not embedding:
                        logger.warning(f"Skipping reference product {product_id}; embedding is empty or unreadable.")
                        continue
                    products.append({
                        "id": str(product_id),
                        "name": name,
                        "sku_code": sku_code,
                        "embedding": embedding
                    })

                logger.info(f"Fetched {len(products)} reference products for client {client_id}.")
                return products
        except Exception as e:
            logger.error(f"Error fetching reference products for client {client_id}: {str(e)}")
            raise e
        finally:
            if conn:
                conn.close()

    def fetch_reference_product_embeddings(self):
        logger.info("Connecting to database to fetch completed reference product embeddings.")
        query_str = """
            SELECT id, name, sku_code, embedding
            FROM reference_products
            WHERE embedding_status = 'complete'
              AND embedding IS NOT NULL
            ORDER BY name ASC, sku_code ASC
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute(query_str)
                rows = cur.fetchall()

                products = []
                for row_data in rows:
                    product_id, name, sku_code, embedding_raw = row_data
                    embedding = self._parse_embedding(embedding_raw)
                    if not embedding:
                        logger.warning(f"Skipping reference product {product_id}; embedding is empty or unreadable.")
                        continue

                    products.append({
                        "id": str(product_id),
                        "name": name,
                        "sku_code": sku_code,
                        "embedding": embedding
                    })

                logger.info(f"Successfully fetched {len(products)} completed reference product embeddings.")
                return products
        except Exception as e:
            logger.error(f"Error fetching reference product embeddings: {str(e)}")
            raise e
        finally:
            if conn:
                conn.close()

# Export singleton database helper
db_queries = DatabaseQueries()
