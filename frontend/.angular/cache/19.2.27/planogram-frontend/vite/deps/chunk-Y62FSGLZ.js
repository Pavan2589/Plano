import {
  NzConfigService,
  WithConfig
} from "./chunk-VKZO6X74.js";
import {
  Directionality
} from "./chunk-I6DJSTSE.js";
import {
  NgTemplateOutlet
} from "./chunk-RDLUSYUK.js";
import {
  ChangeDetectorRef,
  Component,
  Input,
  NgModule,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵreference,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-WPBYGH2V.js";
import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
  __esDecorate,
  __runInitializers,
  debounce,
  distinctUntilChanged,
  startWith,
  switchMap,
  takeUntil,
  timer
} from "./chunk-NNMCRNBG.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-spin.mjs
var _c0 = ["*"];
function NzSpinComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 2);
    ɵɵelement(1, "i", 3)(2, "i", 3)(3, "i", 3)(4, "i", 3);
    ɵɵelementEnd();
  }
}
function NzSpinComponent_Conditional_2_ng_template_2_Template(rf, ctx) {
}
function NzSpinComponent_Conditional_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 6);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.nzTip);
  }
}
function NzSpinComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div")(1, "div", 4);
    ɵɵtemplate(2, NzSpinComponent_Conditional_2_ng_template_2_Template, 0, 0, "ng-template", 5)(3, NzSpinComponent_Conditional_2_Conditional_3_Template, 2, 1, "div", 6);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    const defaultTemplate_r2 = ɵɵreference(1);
    ɵɵadvance();
    ɵɵclassProp("ant-spin-rtl", ctx_r0.dir === "rtl")("ant-spin-spinning", ctx_r0.isLoading)("ant-spin-lg", ctx_r0.nzSize === "large")("ant-spin-sm", ctx_r0.nzSize === "small")("ant-spin-show-text", ctx_r0.nzTip);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r0.nzIndicator || defaultTemplate_r2);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.nzTip ? 3 : -1);
  }
}
function NzSpinComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 7);
    ɵɵprojection(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵclassProp("ant-spin-blur", ctx_r0.isLoading);
  }
}
var NZ_CONFIG_MODULE_NAME = "spin";
var NzSpinComponent = (() => {
  let _nzIndicator_decorators;
  let _nzIndicator_initializers = [];
  let _nzIndicator_extraInitializers = [];
  return class NzSpinComponent2 {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
      _nzIndicator_decorators = [WithConfig()];
      __esDecorate(null, null, _nzIndicator_decorators, {
        kind: "field",
        name: "nzIndicator",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzIndicator" in obj,
          get: (obj) => obj.nzIndicator,
          set: (obj, value) => {
            obj.nzIndicator = value;
          }
        },
        metadata: _metadata
      }, _nzIndicator_initializers, _nzIndicator_extraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata
      });
    }
    nzConfigService;
    cdr;
    directionality;
    _nzModuleName = NZ_CONFIG_MODULE_NAME;
    nzIndicator = __runInitializers(this, _nzIndicator_initializers, null);
    nzSize = (__runInitializers(this, _nzIndicator_extraInitializers), "default");
    nzTip = null;
    nzDelay = 0;
    nzSimple = false;
    nzSpinning = true;
    destroy$ = new Subject();
    spinning$ = new BehaviorSubject(this.nzSpinning);
    delay$ = new ReplaySubject(1);
    isLoading = false;
    dir = "ltr";
    constructor(nzConfigService, cdr, directionality) {
      this.nzConfigService = nzConfigService;
      this.cdr = cdr;
      this.directionality = directionality;
    }
    ngOnInit() {
      const loading$ = this.delay$.pipe(startWith(this.nzDelay), distinctUntilChanged(), switchMap((delay) => {
        if (delay === 0) {
          return this.spinning$;
        }
        return this.spinning$.pipe(debounce((spinning) => timer(spinning ? delay : 0)));
      }), takeUntil(this.destroy$));
      loading$.subscribe((loading) => {
        this.isLoading = loading;
        this.cdr.markForCheck();
      });
      this.nzConfigService.getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME).pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
      this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });
      this.dir = this.directionality.value;
    }
    ngOnChanges(changes) {
      const {
        nzSpinning,
        nzDelay
      } = changes;
      if (nzSpinning) {
        this.spinning$.next(this.nzSpinning);
      }
      if (nzDelay) {
        this.delay$.next(this.nzDelay);
      }
    }
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
    static ɵfac = function NzSpinComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || NzSpinComponent2)(ɵɵdirectiveInject(NzConfigService), ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(Directionality));
    };
    static ɵcmp = ɵɵdefineComponent({
      type: NzSpinComponent2,
      selectors: [["nz-spin"]],
      hostVars: 2,
      hostBindings: function NzSpinComponent_HostBindings(rf, ctx) {
        if (rf & 2) {
          ɵɵclassProp("ant-spin-nested-loading", !ctx.nzSimple);
        }
      },
      inputs: {
        nzIndicator: "nzIndicator",
        nzSize: "nzSize",
        nzTip: "nzTip",
        nzDelay: [2, "nzDelay", "nzDelay", numberAttribute],
        nzSimple: [2, "nzSimple", "nzSimple", booleanAttribute],
        nzSpinning: [2, "nzSpinning", "nzSpinning", booleanAttribute]
      },
      exportAs: ["nzSpin"],
      features: [ɵɵNgOnChangesFeature],
      ngContentSelectors: _c0,
      decls: 4,
      vars: 2,
      consts: [["defaultTemplate", ""], [1, "ant-spin-container", 3, "ant-spin-blur"], [1, "ant-spin-dot", "ant-spin-dot-spin"], [1, "ant-spin-dot-item"], [1, "ant-spin"], [3, "ngTemplateOutlet"], [1, "ant-spin-text"], [1, "ant-spin-container"]],
      template: function NzSpinComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵprojectionDef();
          ɵɵtemplate(0, NzSpinComponent_ng_template_0_Template, 5, 0, "ng-template", null, 0, ɵɵtemplateRefExtractor)(2, NzSpinComponent_Conditional_2_Template, 4, 12, "div")(3, NzSpinComponent_Conditional_3_Template, 2, 2, "div", 1);
        }
        if (rf & 2) {
          ɵɵadvance(2);
          ɵɵconditional(ctx.isLoading ? 2 : -1);
          ɵɵadvance();
          ɵɵconditional(!ctx.nzSimple ? 3 : -1);
        }
      },
      dependencies: [NgTemplateOutlet],
      encapsulation: 2
    });
  };
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSpinComponent, [{
    type: Component,
    args: [{
      selector: "nz-spin",
      exportAs: "nzSpin",
      preserveWhitespaces: false,
      encapsulation: ViewEncapsulation.None,
      template: `
    <ng-template #defaultTemplate>
      <span class="ant-spin-dot ant-spin-dot-spin">
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
      </span>
    </ng-template>
    @if (isLoading) {
      <div>
        <div
          class="ant-spin"
          [class.ant-spin-rtl]="dir === 'rtl'"
          [class.ant-spin-spinning]="isLoading"
          [class.ant-spin-lg]="nzSize === 'large'"
          [class.ant-spin-sm]="nzSize === 'small'"
          [class.ant-spin-show-text]="nzTip"
        >
          <ng-template [ngTemplateOutlet]="nzIndicator || defaultTemplate"></ng-template>
          @if (nzTip) {
            <div class="ant-spin-text">{{ nzTip }}</div>
          }
        </div>
      </div>
    }
    @if (!nzSimple) {
      <div class="ant-spin-container" [class.ant-spin-blur]="isLoading">
        <ng-content></ng-content>
      </div>
    }
  `,
      host: {
        "[class.ant-spin-nested-loading]": "!nzSimple"
      },
      imports: [NgTemplateOutlet]
    }]
  }], () => [{
    type: NzConfigService
  }, {
    type: ChangeDetectorRef
  }, {
    type: Directionality
  }], {
    nzIndicator: [{
      type: Input
    }],
    nzSize: [{
      type: Input
    }],
    nzTip: [{
      type: Input
    }],
    nzDelay: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    nzSimple: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzSpinning: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var NzSpinModule = class _NzSpinModule {
  static ɵfac = function NzSpinModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSpinModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzSpinModule,
    imports: [NzSpinComponent],
    exports: [NzSpinComponent]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSpinModule, [{
    type: NgModule,
    args: [{
      imports: [NzSpinComponent],
      exports: [NzSpinComponent]
    }]
  }], null, null);
})();

export {
  NzSpinComponent,
  NzSpinModule
};
//# sourceMappingURL=chunk-Y62FSGLZ.js.map
