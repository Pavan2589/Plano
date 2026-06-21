import {
  Overlay
} from "./chunk-PAHJKAOB.js";
import "./chunk-RE5HV6VE.js";
import {
  moveUpMotion
} from "./chunk-ZLGN2VU7.js";
import "./chunk-CNCSLJ2F.js";
import {
  NzSingletonService
} from "./chunk-SCFYAFS5.js";
import {
  NzIconDirective,
  NzIconModule
} from "./chunk-K6EEFYCK.js";
import "./chunk-5XFURQEN.js";
import "./chunk-XYB6LS4A.js";
import "./chunk-OIBNGD5S.js";
import {
  ComponentPortal
} from "./chunk-XZMGY27W.js";
import "./chunk-BQ76GOFF.js";
import {
  NzConfigService
} from "./chunk-VKZO6X74.js";
import {
  NzOutletModule,
  NzStringTemplateOutletDirective
} from "./chunk-TCDNIHNP.js";
import {
  toCssPixel
} from "./chunk-QVFLLOPW.js";
import "./chunk-I6DJSTSE.js";
import "./chunk-4AH7WMHY.js";
import "./chunk-FECPQMV6.js";
import "./chunk-WL33A23K.js";
import "./chunk-PN5HWABK.js";
import "./chunk-RDLUSYUK.js";
import "./chunk-FDLDX6DK.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  EventEmitter,
  Injectable,
  Injector,
  Input,
  NgModule,
  Output,
  ViewEncapsulation,
  inject,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵinject,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction2,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵstyleProp,
  ɵɵtemplate
} from "./chunk-WPBYGH2V.js";
import {
  Subject,
  filter,
  take,
  takeUntil
} from "./chunk-NNMCRNBG.js";
import {
  __spreadValues
} from "./chunk-WDMUDEB6.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-message.mjs
var _c0 = (a0, a1) => ({
  $implicit: a0,
  data: a1
});
function NzMessageComponent_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 3);
  }
}
function NzMessageComponent_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 4);
  }
}
function NzMessageComponent_Case_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 5);
  }
}
function NzMessageComponent_Case_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 6);
  }
}
function NzMessageComponent_Case_7_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 7);
  }
}
function NzMessageComponent_ng_container_8_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelement(1, "span", 9);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("innerHTML", ctx_r0.instance.content, ɵɵsanitizeHtml);
  }
}
function NzMessageContainerComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "nz-message", 2);
    ɵɵlistener("destroyed", function NzMessageContainerComponent_For_2_Template_nz_message_destroyed_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.remove($event.id, $event.userAction));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const instance_r3 = ctx.$implicit;
    ɵɵproperty("instance", instance_r3);
  }
}
var globalCounter = 0;
var NzMNService = class {
  overlay;
  injector;
  container;
  nzSingletonService = inject(NzSingletonService);
  constructor(overlay, injector) {
    this.overlay = overlay;
    this.injector = injector;
  }
  remove(id) {
    if (this.container) {
      if (id) {
        this.container.remove(id);
      } else {
        this.container.removeAll();
      }
    }
  }
  getInstanceId() {
    return `${this.componentPrefix}-${globalCounter++}`;
  }
  withContainer(ctor) {
    let containerInstance = this.nzSingletonService.getSingletonWithKey(this.componentPrefix);
    if (containerInstance) {
      return containerInstance;
    }
    const overlayRef = this.overlay.create({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy: this.overlay.position().global()
    });
    const componentPortal = new ComponentPortal(ctor, null, this.injector);
    const componentRef = overlayRef.attach(componentPortal);
    const overlayWrapper = overlayRef.hostElement;
    overlayWrapper.style.zIndex = "1010";
    if (!containerInstance) {
      this.container = containerInstance = componentRef.instance;
      this.nzSingletonService.registerSingletonWithKey(this.componentPrefix, containerInstance);
      this.container.afterAllInstancesRemoved.subscribe(() => {
        this.container = void 0;
        this.nzSingletonService.unregisterSingletonWithKey(this.componentPrefix);
        overlayRef.dispose();
      });
    }
    return containerInstance;
  }
};
var NzMNContainerComponent = class _NzMNContainerComponent {
  config;
  instances = [];
  _afterAllInstancesRemoved = new Subject();
  afterAllInstancesRemoved = this._afterAllInstancesRemoved.asObservable();
  cdr = inject(ChangeDetectorRef);
  nzConfigService = inject(NzConfigService);
  destroy$ = new Subject();
  ngOnInit() {
    this.subscribeConfigChange();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  create(data) {
    const instance = this.onCreate(data);
    if (this.instances.length >= this.config.nzMaxStack) {
      this.instances = this.instances.slice(1);
    }
    this.instances = [...this.instances, instance];
    this.readyInstances();
    return instance;
  }
  remove(id, userAction = false) {
    this.instances.map((instance, index) => ({
      index,
      instance
    })).filter(({
      instance
    }) => instance.messageId === id).forEach(({
      index,
      instance
    }) => {
      this.instances.splice(index, 1);
      this.instances = [...this.instances];
      this.onRemove(instance, userAction);
      this.readyInstances();
    });
    if (!this.instances.length) {
      this.onAllInstancesRemoved();
    }
  }
  removeAll() {
    this.instances.forEach((i) => this.onRemove(i, false));
    this.instances = [];
    this.readyInstances();
    this.onAllInstancesRemoved();
  }
  onCreate(instance) {
    instance.options = this.mergeOptions(instance.options);
    instance.onClose = new Subject();
    return instance;
  }
  onRemove(instance, userAction) {
    instance.onClose.next(userAction);
    instance.onClose.complete();
  }
  onAllInstancesRemoved() {
    this._afterAllInstancesRemoved.next();
    this._afterAllInstancesRemoved.complete();
  }
  readyInstances() {
    this.cdr.detectChanges();
  }
  mergeOptions(options) {
    const {
      nzDuration,
      nzAnimate,
      nzPauseOnHover
    } = this.config;
    return __spreadValues({
      nzDuration,
      nzAnimate,
      nzPauseOnHover
    }, options);
  }
  static ɵfac = function NzMNContainerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzMNContainerComponent)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzMNContainerComponent
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzMNContainerComponent, [{
    type: Directive
  }], null, null);
})();
var NzMNComponent = class _NzMNComponent {
  cdr = inject(ChangeDetectorRef);
  animationStateChanged = new Subject();
  options;
  autoClose;
  closeTimer;
  userAction = false;
  eraseTimer;
  eraseTimingStart;
  eraseTTL;
  ngOnInit() {
    this.options = this.instance.options;
    if (this.options.nzAnimate) {
      this.instance.state = "enter";
      this.animationStateChanged.pipe(filter((event) => event.phaseName === "done" && event.toState === "leave"), take(1)).subscribe(() => {
        clearTimeout(this.closeTimer);
        this.destroyed.next({
          id: this.instance.messageId,
          userAction: this.userAction
        });
      });
    }
    this.autoClose = this.options.nzDuration > 0;
    if (this.autoClose) {
      this.initErase();
      this.startEraseTimeout();
    }
  }
  ngOnDestroy() {
    if (this.autoClose) {
      this.clearEraseTimeout();
    }
    this.animationStateChanged.complete();
  }
  onEnter() {
    if (this.autoClose && this.options.nzPauseOnHover) {
      this.clearEraseTimeout();
      this.updateTTL();
    }
  }
  onLeave() {
    if (this.autoClose && this.options.nzPauseOnHover) {
      this.startEraseTimeout();
    }
  }
  destroy(userAction = false) {
    this.userAction = userAction;
    if (this.options.nzAnimate) {
      this.instance.state = "leave";
      this.cdr.detectChanges();
      this.closeTimer = setTimeout(() => {
        this.closeTimer = void 0;
        this.destroyed.next({
          id: this.instance.messageId,
          userAction
        });
      }, 200);
    } else {
      this.destroyed.next({
        id: this.instance.messageId,
        userAction
      });
    }
  }
  initErase() {
    this.eraseTTL = this.options.nzDuration;
    this.eraseTimingStart = Date.now();
  }
  updateTTL() {
    if (this.autoClose) {
      this.eraseTTL -= Date.now() - this.eraseTimingStart;
    }
  }
  startEraseTimeout() {
    if (this.eraseTTL > 0) {
      this.clearEraseTimeout();
      this.eraseTimer = setTimeout(() => this.destroy(), this.eraseTTL);
      this.eraseTimingStart = Date.now();
    } else {
      this.destroy();
    }
  }
  clearEraseTimeout() {
    if (this.eraseTimer !== null) {
      clearTimeout(this.eraseTimer);
      this.eraseTimer = void 0;
    }
  }
  static ɵfac = function NzMNComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzMNComponent)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzMNComponent
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzMNComponent, [{
    type: Directive
  }], null, null);
})();
var NzMessageComponent = class _NzMessageComponent extends NzMNComponent {
  instance;
  destroyed = new EventEmitter();
  index;
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵNzMessageComponent_BaseFactory;
    return function NzMessageComponent_Factory(__ngFactoryType__) {
      return (ɵNzMessageComponent_BaseFactory || (ɵNzMessageComponent_BaseFactory = ɵɵgetInheritedFactory(_NzMessageComponent)))(__ngFactoryType__ || _NzMessageComponent);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _NzMessageComponent,
    selectors: [["nz-message"]],
    inputs: {
      instance: "instance"
    },
    outputs: {
      destroyed: "destroyed"
    },
    exportAs: ["nzMessage"],
    features: [ɵɵInheritDefinitionFeature],
    decls: 9,
    vars: 9,
    consts: [[1, "ant-message-notice", 3, "mouseenter", "mouseleave"], [1, "ant-message-notice-content"], [1, "ant-message-custom-content"], ["nzType", "check-circle"], ["nzType", "info-circle"], ["nzType", "exclamation-circle"], ["nzType", "close-circle"], ["nzType", "loading"], [4, "nzStringTemplateOutlet", "nzStringTemplateOutletContext"], [3, "innerHTML"]],
    template: function NzMessageComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "div", 0);
        ɵɵlistener("@moveUpMotion.done", function NzMessageComponent_Template_div_animation_moveUpMotion_done_0_listener($event) {
          return ctx.animationStateChanged.next($event);
        })("mouseenter", function NzMessageComponent_Template_div_mouseenter_0_listener() {
          return ctx.onEnter();
        })("mouseleave", function NzMessageComponent_Template_div_mouseleave_0_listener() {
          return ctx.onLeave();
        });
        ɵɵelementStart(1, "div", 1)(2, "div", 2);
        ɵɵtemplate(3, NzMessageComponent_Case_3_Template, 1, 0, "nz-icon", 3)(4, NzMessageComponent_Case_4_Template, 1, 0, "nz-icon", 4)(5, NzMessageComponent_Case_5_Template, 1, 0, "nz-icon", 5)(6, NzMessageComponent_Case_6_Template, 1, 0, "nz-icon", 6)(7, NzMessageComponent_Case_7_Template, 1, 0, "nz-icon", 7)(8, NzMessageComponent_ng_container_8_Template, 2, 1, "ng-container", 8);
        ɵɵelementEnd()()();
      }
      if (rf & 2) {
        let tmp_2_0;
        ɵɵproperty("@moveUpMotion", ctx.instance.state);
        ɵɵadvance(2);
        ɵɵclassMap("ant-message-" + ctx.instance.type);
        ɵɵadvance();
        ɵɵconditional((tmp_2_0 = ctx.instance.type) === "success" ? 3 : tmp_2_0 === "info" ? 4 : tmp_2_0 === "warning" ? 5 : tmp_2_0 === "error" ? 6 : tmp_2_0 === "loading" ? 7 : -1);
        ɵɵadvance(5);
        ɵɵproperty("nzStringTemplateOutlet", ctx.instance.content)("nzStringTemplateOutletContext", ɵɵpureFunction2(6, _c0, ctx, ctx.instance.options == null ? null : ctx.instance.options.nzData));
      }
    },
    dependencies: [NzIconModule, NzIconDirective, NzOutletModule, NzStringTemplateOutletDirective],
    encapsulation: 2,
    data: {
      animation: [moveUpMotion]
    },
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzMessageComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-message",
      exportAs: "nzMessage",
      preserveWhitespaces: false,
      animations: [moveUpMotion],
      template: `
    <div
      class="ant-message-notice"
      [@moveUpMotion]="instance.state"
      (@moveUpMotion.done)="animationStateChanged.next($event)"
      (mouseenter)="onEnter()"
      (mouseleave)="onLeave()"
    >
      <div class="ant-message-notice-content">
        <div class="ant-message-custom-content" [class]="'ant-message-' + instance.type">
          @switch (instance.type) {
            @case ('success') {
              <nz-icon nzType="check-circle" />
            }
            @case ('info') {
              <nz-icon nzType="info-circle" />
            }
            @case ('warning') {
              <nz-icon nzType="exclamation-circle" />
            }
            @case ('error') {
              <nz-icon nzType="close-circle" />
            }
            @case ('loading') {
              <nz-icon nzType="loading" />
            }
          }
          <ng-container
            *nzStringTemplateOutlet="instance.content; context: { $implicit: this, data: instance.options?.nzData }"
          >
            <span [innerHTML]="instance.content"></span>
          </ng-container>
        </div>
      </div>
    </div>
  `,
      imports: [NzIconModule, NzOutletModule]
    }]
  }], null, {
    instance: [{
      type: Input
    }],
    destroyed: [{
      type: Output
    }]
  });
})();
var NZ_CONFIG_COMPONENT_NAME = "message";
var NZ_MESSAGE_DEFAULT_CONFIG = {
  nzAnimate: true,
  nzDuration: 3e3,
  nzMaxStack: 7,
  nzPauseOnHover: true,
  nzTop: 24,
  nzDirection: "ltr"
};
var NzMessageContainerComponent = class _NzMessageContainerComponent extends NzMNContainerComponent {
  dir = this.nzConfigService.getConfigForComponent(NZ_CONFIG_COMPONENT_NAME)?.nzDirection || "ltr";
  top;
  constructor() {
    super();
    this.updateConfig();
  }
  subscribeConfigChange() {
    this.nzConfigService.getConfigChangeEventForComponent(NZ_CONFIG_COMPONENT_NAME).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateConfig();
      this.dir = this.nzConfigService.getConfigForComponent(NZ_CONFIG_COMPONENT_NAME)?.nzDirection || this.dir;
    });
  }
  updateConfig() {
    this.config = __spreadValues(__spreadValues(__spreadValues({}, NZ_MESSAGE_DEFAULT_CONFIG), this.config), this.nzConfigService.getConfigForComponent(NZ_CONFIG_COMPONENT_NAME));
    this.top = toCssPixel(this.config.nzTop);
    this.cdr.markForCheck();
  }
  static ɵfac = function NzMessageContainerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzMessageContainerComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzMessageContainerComponent,
    selectors: [["nz-message-container"]],
    exportAs: ["nzMessageContainer"],
    features: [ɵɵInheritDefinitionFeature],
    decls: 3,
    vars: 4,
    consts: [[1, "ant-message"], [3, "instance"], [3, "destroyed", "instance"]],
    template: function NzMessageContainerComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "div", 0);
        ɵɵrepeaterCreate(1, NzMessageContainerComponent_For_2_Template, 1, 1, "nz-message", 1, ɵɵrepeaterTrackByIdentity);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵstyleProp("top", ctx.top);
        ɵɵclassProp("ant-message-rtl", ctx.dir === "rtl");
        ɵɵadvance();
        ɵɵrepeater(ctx.instances);
      }
    },
    dependencies: [NzMessageComponent],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzMessageContainerComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-message-container",
      exportAs: "nzMessageContainer",
      preserveWhitespaces: false,
      template: `
    <div class="ant-message" [class.ant-message-rtl]="dir === 'rtl'" [style.top]="top">
      @for (instance of instances; track instance) {
        <nz-message [instance]="instance" (destroyed)="remove($event.id, $event.userAction)"></nz-message>
      }
    </div>
  `,
      imports: [NzMessageComponent]
    }]
  }], () => [], null);
})();
var NzMessageModule = class _NzMessageModule {
  static ɵfac = function NzMessageModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzMessageModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzMessageModule,
    imports: [NzMessageContainerComponent, NzMessageComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [NzMessageContainerComponent, NzMessageComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzMessageModule, [{
    type: NgModule,
    args: [{
      imports: [NzMessageContainerComponent, NzMessageComponent]
    }]
  }], null, null);
})();
var NzMessageService = class _NzMessageService extends NzMNService {
  componentPrefix = "message-";
  constructor(overlay, injector) {
    super(overlay, injector);
  }
  success(content, options) {
    return this.createInstance({
      type: "success",
      content
    }, options);
  }
  error(content, options) {
    return this.createInstance({
      type: "error",
      content
    }, options);
  }
  info(content, options) {
    return this.createInstance({
      type: "info",
      content
    }, options);
  }
  warning(content, options) {
    return this.createInstance({
      type: "warning",
      content
    }, options);
  }
  loading(content, options) {
    return this.createInstance({
      type: "loading",
      content
    }, options);
  }
  create(type, content, options) {
    return this.createInstance({
      type,
      content
    }, options);
  }
  createInstance(message, options) {
    this.container = this.withContainer(NzMessageContainerComponent);
    return this.container.create(__spreadValues(__spreadValues({}, message), {
      createdAt: /* @__PURE__ */ new Date(),
      messageId: this.getInstanceId(),
      options
    }));
  }
  static ɵfac = function NzMessageService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzMessageService)(ɵɵinject(Overlay), ɵɵinject(Injector));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzMessageService,
    factory: _NzMessageService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzMessageService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: Overlay
  }, {
    type: Injector
  }], null);
})();
export {
  NzMNComponent,
  NzMNContainerComponent,
  NzMNService,
  NzMessageComponent,
  NzMessageContainerComponent,
  NzMessageModule,
  NzMessageService
};
//# sourceMappingURL=ng-zorro-antd_message.js.map
