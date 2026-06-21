import {
  slideAlertMotion
} from "./chunk-ZLGN2VU7.js";
import "./chunk-CNCSLJ2F.js";
import {
  NzIconDirective,
  NzIconModule
} from "./chunk-K6EEFYCK.js";
import "./chunk-5XFURQEN.js";
import "./chunk-XYB6LS4A.js";
import "./chunk-BQ76GOFF.js";
import {
  NzConfigService,
  WithConfig
} from "./chunk-VKZO6X74.js";
import {
  NzOutletModule,
  NzStringTemplateOutletDirective
} from "./chunk-TCDNIHNP.js";
import "./chunk-QVFLLOPW.js";
import {
  Directionality
} from "./chunk-I6DJSTSE.js";
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
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewEncapsulation,
  booleanAttribute,
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
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-WPBYGH2V.js";
import {
  Subject,
  __esDecorate,
  __runInitializers,
  takeUntil
} from "./chunk-NNMCRNBG.js";
import "./chunk-WDMUDEB6.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-alert.mjs
function NzAlertComponent_Conditional_0_Conditional_1_Conditional_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function NzAlertComponent_Conditional_0_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzAlertComponent_Conditional_0_Conditional_1_Conditional_1_ng_container_0_Template, 1, 0, "ng-container", 7);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵproperty("nzStringTemplateOutlet", ctx_r1.nzIcon);
  }
}
function NzAlertComponent_Conditional_0_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 6);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵproperty("nzType", ctx_r1.nzIconType || ctx_r1.inferredIconType)("nzTheme", ctx_r1.iconTheme);
  }
}
function NzAlertComponent_Conditional_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 2);
    ɵɵtemplate(1, NzAlertComponent_Conditional_0_Conditional_1_Conditional_1_Template, 1, 1, "ng-container")(2, NzAlertComponent_Conditional_0_Conditional_1_Conditional_2_Template, 1, 2, "nz-icon", 6);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzIcon ? 1 : 2);
  }
}
function NzAlertComponent_Conditional_0_Conditional_2_Conditional_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.nzMessage);
  }
}
function NzAlertComponent_Conditional_0_Conditional_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 8);
    ɵɵtemplate(1, NzAlertComponent_Conditional_0_Conditional_2_Conditional_1_ng_container_1_Template, 2, 1, "ng-container", 7);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r1.nzMessage);
  }
}
function NzAlertComponent_Conditional_0_Conditional_2_Conditional_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.nzDescription);
  }
}
function NzAlertComponent_Conditional_0_Conditional_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 9);
    ɵɵtemplate(1, NzAlertComponent_Conditional_0_Conditional_2_Conditional_2_ng_container_1_Template, 2, 1, "ng-container", 7);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r1.nzDescription);
  }
}
function NzAlertComponent_Conditional_0_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 3);
    ɵɵtemplate(1, NzAlertComponent_Conditional_0_Conditional_2_Conditional_1_Template, 2, 1, "span", 8)(2, NzAlertComponent_Conditional_0_Conditional_2_Conditional_2_Template, 2, 1, "span", 9);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzMessage ? 1 : -1);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzDescription ? 2 : -1);
  }
}
function NzAlertComponent_Conditional_0_Conditional_3_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.nzAction);
  }
}
function NzAlertComponent_Conditional_0_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 4);
    ɵɵtemplate(1, NzAlertComponent_Conditional_0_Conditional_3_ng_container_1_Template, 2, 1, "ng-container", 7);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r1.nzAction);
  }
}
function NzAlertComponent_Conditional_0_Conditional_4_Conditional_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelementStart(1, "span", 12);
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵadvance(2);
    ɵɵtextInterpolate(ctx_r1.nzCloseText);
  }
}
function NzAlertComponent_Conditional_0_Conditional_4_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzAlertComponent_Conditional_0_Conditional_4_Conditional_1_ng_container_0_Template, 3, 1, "ng-container", 7);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵproperty("nzStringTemplateOutlet", ctx_r1.nzCloseText);
  }
}
function NzAlertComponent_Conditional_0_Conditional_4_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 11);
  }
}
function NzAlertComponent_Conditional_0_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "button", 10);
    ɵɵlistener("click", function NzAlertComponent_Conditional_0_Conditional_4_Template_button_click_0_listener() {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.closeAlert());
    });
    ɵɵtemplate(1, NzAlertComponent_Conditional_0_Conditional_4_Conditional_1_Template, 1, 1, "ng-container")(2, NzAlertComponent_Conditional_0_Conditional_4_Conditional_2_Template, 1, 0, "nz-icon", 11);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzCloseText ? 1 : 2);
  }
}
function NzAlertComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 1);
    ɵɵlistener("@slideAlertMotion.done", function NzAlertComponent_Conditional_0_Template_div_animation_slideAlertMotion_done_0_listener() {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onFadeAnimationDone());
    });
    ɵɵtemplate(1, NzAlertComponent_Conditional_0_Conditional_1_Template, 3, 1, "div", 2)(2, NzAlertComponent_Conditional_0_Conditional_2_Template, 3, 2, "div", 3)(3, NzAlertComponent_Conditional_0_Conditional_3_Template, 2, 1, "div", 4)(4, NzAlertComponent_Conditional_0_Conditional_4_Template, 3, 1, "button", 5);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵclassProp("ant-alert-rtl", ctx_r1.dir === "rtl")("ant-alert-success", ctx_r1.nzType === "success")("ant-alert-info", ctx_r1.nzType === "info")("ant-alert-warning", ctx_r1.nzType === "warning")("ant-alert-error", ctx_r1.nzType === "error")("ant-alert-no-icon", !ctx_r1.nzShowIcon)("ant-alert-banner", ctx_r1.nzBanner)("ant-alert-closable", ctx_r1.nzCloseable)("ant-alert-with-description", !!ctx_r1.nzDescription);
    ɵɵproperty("@.disabled", ctx_r1.nzNoAnimation)("@slideAlertMotion", void 0);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzShowIcon ? 1 : -1);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzMessage || ctx_r1.nzDescription ? 2 : -1);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzAction ? 3 : -1);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.nzCloseable || ctx_r1.nzCloseText ? 4 : -1);
  }
}
var NZ_CONFIG_MODULE_NAME = "alert";
var NzAlertComponent = (() => {
  let _nzCloseable_decorators;
  let _nzCloseable_initializers = [];
  let _nzCloseable_extraInitializers = [];
  let _nzShowIcon_decorators;
  let _nzShowIcon_initializers = [];
  let _nzShowIcon_extraInitializers = [];
  return class NzAlertComponent2 {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
      _nzCloseable_decorators = [WithConfig()];
      _nzShowIcon_decorators = [WithConfig()];
      __esDecorate(null, null, _nzCloseable_decorators, {
        kind: "field",
        name: "nzCloseable",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzCloseable" in obj,
          get: (obj) => obj.nzCloseable,
          set: (obj, value) => {
            obj.nzCloseable = value;
          }
        },
        metadata: _metadata
      }, _nzCloseable_initializers, _nzCloseable_extraInitializers);
      __esDecorate(null, null, _nzShowIcon_decorators, {
        kind: "field",
        name: "nzShowIcon",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzShowIcon" in obj,
          get: (obj) => obj.nzShowIcon,
          set: (obj, value) => {
            obj.nzShowIcon = value;
          }
        },
        metadata: _metadata
      }, _nzShowIcon_initializers, _nzShowIcon_extraInitializers);
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
    nzAction = null;
    nzCloseText = null;
    nzIconType = null;
    nzMessage = null;
    nzDescription = null;
    nzType = "info";
    nzCloseable = __runInitializers(this, _nzCloseable_initializers, false);
    nzShowIcon = (__runInitializers(this, _nzCloseable_extraInitializers), __runInitializers(this, _nzShowIcon_initializers, false));
    nzBanner = (__runInitializers(this, _nzShowIcon_extraInitializers), false);
    nzNoAnimation = false;
    nzIcon = null;
    nzOnClose = new EventEmitter();
    closed = false;
    iconTheme = "fill";
    inferredIconType = "info-circle";
    dir = "ltr";
    isTypeSet = false;
    isShowIconSet = false;
    destroy$ = new Subject();
    constructor(nzConfigService, cdr, directionality) {
      this.nzConfigService = nzConfigService;
      this.cdr = cdr;
      this.directionality = directionality;
      this.nzConfigService.getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.cdr.markForCheck();
      });
    }
    ngOnInit() {
      this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });
      this.dir = this.directionality.value;
    }
    closeAlert() {
      this.closed = true;
    }
    onFadeAnimationDone() {
      if (this.closed) {
        this.nzOnClose.emit(true);
      }
    }
    ngOnChanges(changes) {
      const {
        nzShowIcon,
        nzDescription,
        nzType,
        nzBanner
      } = changes;
      if (nzShowIcon) {
        this.isShowIconSet = true;
      }
      if (nzType) {
        this.isTypeSet = true;
        switch (this.nzType) {
          case "error":
            this.inferredIconType = "close-circle";
            break;
          case "success":
            this.inferredIconType = "check-circle";
            break;
          case "info":
            this.inferredIconType = "info-circle";
            break;
          case "warning":
            this.inferredIconType = "exclamation-circle";
            break;
        }
      }
      if (nzDescription) {
        this.iconTheme = this.nzDescription ? "outline" : "fill";
      }
      if (nzBanner) {
        if (!this.isTypeSet) {
          this.nzType = "warning";
        }
        if (!this.isShowIconSet) {
          this.nzShowIcon = true;
        }
      }
    }
    ngOnDestroy() {
      this.destroy$.next(true);
      this.destroy$.complete();
    }
    static ɵfac = function NzAlertComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || NzAlertComponent2)(ɵɵdirectiveInject(NzConfigService), ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(Directionality));
    };
    static ɵcmp = ɵɵdefineComponent({
      type: NzAlertComponent2,
      selectors: [["nz-alert"]],
      inputs: {
        nzAction: "nzAction",
        nzCloseText: "nzCloseText",
        nzIconType: "nzIconType",
        nzMessage: "nzMessage",
        nzDescription: "nzDescription",
        nzType: "nzType",
        nzCloseable: [2, "nzCloseable", "nzCloseable", booleanAttribute],
        nzShowIcon: [2, "nzShowIcon", "nzShowIcon", booleanAttribute],
        nzBanner: [2, "nzBanner", "nzBanner", booleanAttribute],
        nzNoAnimation: [2, "nzNoAnimation", "nzNoAnimation", booleanAttribute],
        nzIcon: "nzIcon"
      },
      outputs: {
        nzOnClose: "nzOnClose"
      },
      exportAs: ["nzAlert"],
      features: [ɵɵNgOnChangesFeature],
      decls: 1,
      vars: 1,
      consts: [[1, "ant-alert", 3, "ant-alert-rtl", "ant-alert-success", "ant-alert-info", "ant-alert-warning", "ant-alert-error", "ant-alert-no-icon", "ant-alert-banner", "ant-alert-closable", "ant-alert-with-description"], [1, "ant-alert"], [1, "ant-alert-icon"], [1, "ant-alert-content"], [1, "ant-alert-action"], ["type", "button", "tabindex", "0", 1, "ant-alert-close-icon"], [3, "nzType", "nzTheme"], [4, "nzStringTemplateOutlet"], [1, "ant-alert-message"], [1, "ant-alert-description"], ["type", "button", "tabindex", "0", 1, "ant-alert-close-icon", 3, "click"], ["nzType", "close"], [1, "ant-alert-close-text"]],
      template: function NzAlertComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, NzAlertComponent_Conditional_0_Template, 5, 24, "div", 0);
        }
        if (rf & 2) {
          ɵɵconditional(!ctx.closed ? 0 : -1);
        }
      },
      dependencies: [NzIconModule, NzIconDirective, NzOutletModule, NzStringTemplateOutletDirective],
      encapsulation: 2,
      data: {
        animation: [slideAlertMotion]
      },
      changeDetection: 0
    });
  };
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzAlertComponent, [{
    type: Component,
    args: [{
      selector: "nz-alert",
      exportAs: "nzAlert",
      animations: [slideAlertMotion],
      imports: [NzIconModule, NzOutletModule],
      template: `
    @if (!closed) {
      <div
        class="ant-alert"
        [class.ant-alert-rtl]="dir === 'rtl'"
        [class.ant-alert-success]="nzType === 'success'"
        [class.ant-alert-info]="nzType === 'info'"
        [class.ant-alert-warning]="nzType === 'warning'"
        [class.ant-alert-error]="nzType === 'error'"
        [class.ant-alert-no-icon]="!nzShowIcon"
        [class.ant-alert-banner]="nzBanner"
        [class.ant-alert-closable]="nzCloseable"
        [class.ant-alert-with-description]="!!nzDescription"
        [@.disabled]="nzNoAnimation"
        [@slideAlertMotion]
        (@slideAlertMotion.done)="onFadeAnimationDone()"
      >
        @if (nzShowIcon) {
          <div class="ant-alert-icon">
            @if (nzIcon) {
              <ng-container *nzStringTemplateOutlet="nzIcon"></ng-container>
            } @else {
              <nz-icon [nzType]="nzIconType || inferredIconType" [nzTheme]="iconTheme" />
            }
          </div>
        }

        @if (nzMessage || nzDescription) {
          <div class="ant-alert-content">
            @if (nzMessage) {
              <span class="ant-alert-message">
                <ng-container *nzStringTemplateOutlet="nzMessage">{{ nzMessage }}</ng-container>
              </span>
            }
            @if (nzDescription) {
              <span class="ant-alert-description">
                <ng-container *nzStringTemplateOutlet="nzDescription">{{ nzDescription }}</ng-container>
              </span>
            }
          </div>
        }

        @if (nzAction) {
          <div class="ant-alert-action">
            <ng-container *nzStringTemplateOutlet="nzAction">{{ nzAction }}</ng-container>
          </div>
        }

        @if (nzCloseable || nzCloseText) {
          <button type="button" tabindex="0" class="ant-alert-close-icon" (click)="closeAlert()">
            @if (nzCloseText) {
              <ng-container *nzStringTemplateOutlet="nzCloseText">
                <span class="ant-alert-close-text">{{ nzCloseText }}</span>
              </ng-container>
            } @else {
              <nz-icon nzType="close" />
            }
          </button>
        }
      </div>
    }
  `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      preserveWhitespaces: false
    }]
  }], () => [{
    type: NzConfigService
  }, {
    type: ChangeDetectorRef
  }, {
    type: Directionality
  }], {
    nzAction: [{
      type: Input
    }],
    nzCloseText: [{
      type: Input
    }],
    nzIconType: [{
      type: Input
    }],
    nzMessage: [{
      type: Input
    }],
    nzDescription: [{
      type: Input
    }],
    nzType: [{
      type: Input
    }],
    nzCloseable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzShowIcon: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzBanner: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzNoAnimation: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzIcon: [{
      type: Input
    }],
    nzOnClose: [{
      type: Output
    }]
  });
})();
var NzAlertModule = class _NzAlertModule {
  static ɵfac = function NzAlertModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzAlertModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzAlertModule,
    imports: [NzAlertComponent],
    exports: [NzAlertComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [NzAlertComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzAlertModule, [{
    type: NgModule,
    args: [{
      exports: [NzAlertComponent],
      imports: [NzAlertComponent]
    }]
  }], null, null);
})();
export {
  NzAlertComponent,
  NzAlertModule
};
//# sourceMappingURL=ng-zorro-antd_alert.js.map
