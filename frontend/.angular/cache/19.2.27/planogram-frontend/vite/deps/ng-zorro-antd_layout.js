import {
  NzMenuDirective
} from "./chunk-QXG5BZPU.js";
import "./chunk-FGFPQC74.js";
import "./chunk-WK7WI2OO.js";
import "./chunk-PAHJKAOB.js";
import "./chunk-RE5HV6VE.js";
import "./chunk-ZLGN2VU7.js";
import "./chunk-CNCSLJ2F.js";
import {
  NzBreakpointService,
  siderResponsiveMap
} from "./chunk-SCFYAFS5.js";
import {
  NzIconDirective,
  NzIconModule
} from "./chunk-K6EEFYCK.js";
import "./chunk-HQBLFY7H.js";
import "./chunk-DBNUL4MM.js";
import "./chunk-5XFURQEN.js";
import {
  Platform
} from "./chunk-XYB6LS4A.js";
import "./chunk-XZMGY27W.js";
import "./chunk-BQ76GOFF.js";
import "./chunk-VKZO6X74.js";
import "./chunk-TCDNIHNP.js";
import {
  inNextTick,
  toCssPixel
} from "./chunk-QVFLLOPW.js";
import {
  Directionality
} from "./chunk-I6DJSTSE.js";
import "./chunk-ZLIU64BA.js";
import "./chunk-4AH7WMHY.js";
import "./chunk-FECPQMV6.js";
import "./chunk-WL33A23K.js";
import "./chunk-PN5HWABK.js";
import {
  NgTemplateOutlet
} from "./chunk-RDLUSYUK.js";
import "./chunk-FDLDX6DK.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  Renderer2,
  ViewEncapsulation,
  booleanAttribute,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor
} from "./chunk-WPBYGH2V.js";
import {
  Subject,
  takeUntil
} from "./chunk-NNMCRNBG.js";
import "./chunk-WDMUDEB6.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-layout.mjs
var _c0 = ["*"];
var _c1 = ["nz-sider-trigger", ""];
function NzSiderTriggerComponent_Conditional_0_ng_template_0_Template(rf, ctx) {
}
function NzSiderTriggerComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzSiderTriggerComponent_Conditional_0_ng_template_0_Template, 0, 0, "ng-template", 2);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    const defaultZeroTrigger_r2 = ɵɵreference(5);
    ɵɵproperty("ngTemplateOutlet", ctx_r0.nzZeroTrigger || defaultZeroTrigger_r2);
  }
}
function NzSiderTriggerComponent_Conditional_1_ng_template_0_Template(rf, ctx) {
}
function NzSiderTriggerComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzSiderTriggerComponent_Conditional_1_ng_template_0_Template, 0, 0, "ng-template", 2);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    const defaultTrigger_r3 = ɵɵreference(3);
    ɵɵproperty("ngTemplateOutlet", ctx_r0.nzTrigger || defaultTrigger_r3);
  }
}
function NzSiderTriggerComponent_ng_template_2_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("nzType", ctx_r0.nzCollapsed ? "left" : "right");
  }
}
function NzSiderTriggerComponent_ng_template_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("nzType", ctx_r0.nzCollapsed ? "right" : "left");
  }
}
function NzSiderTriggerComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzSiderTriggerComponent_ng_template_2_Conditional_0_Template, 1, 1, "nz-icon", 3)(1, NzSiderTriggerComponent_ng_template_2_Conditional_1_Template, 1, 1, "nz-icon", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵconditional(ctx_r0.nzReverseArrow ? 0 : 1);
  }
}
function NzSiderTriggerComponent_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 4);
  }
}
function NzSiderComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 2);
    ɵɵlistener("click", function NzSiderComponent_Conditional_2_Template_div_click_0_listener() {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.setCollapsed(!ctx_r1.nzCollapsed));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵproperty("matchBreakPoint", ctx_r1.matchBreakPoint)("nzCollapsedWidth", ctx_r1.nzCollapsedWidth)("nzCollapsed", ctx_r1.nzCollapsed)("nzBreakpoint", ctx_r1.nzBreakpoint)("nzReverseArrow", ctx_r1.nzReverseArrow)("nzTrigger", ctx_r1.nzTrigger)("nzZeroTrigger", ctx_r1.nzZeroTrigger)("siderWidth", ctx_r1.widthSetting);
  }
}
var NzContentComponent = class _NzContentComponent {
  elementRef;
  renderer;
  constructor(elementRef, renderer) {
    this.elementRef = elementRef;
    this.renderer = renderer;
    this.renderer.addClass(this.elementRef.nativeElement, "ant-layout-content");
  }
  static ɵfac = function NzContentComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzContentComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzContentComponent,
    selectors: [["nz-content"]],
    exportAs: ["nzContent"],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function NzContentComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzContentComponent, [{
    type: Component,
    args: [{
      selector: "nz-content",
      exportAs: "nzContent",
      template: `<ng-content></ng-content>`,
      preserveWhitespaces: false,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: Renderer2
  }], null);
})();
var NzFooterComponent = class _NzFooterComponent {
  elementRef;
  renderer;
  constructor(elementRef, renderer) {
    this.elementRef = elementRef;
    this.renderer = renderer;
    this.renderer.addClass(this.elementRef.nativeElement, "ant-layout-footer");
  }
  static ɵfac = function NzFooterComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzFooterComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzFooterComponent,
    selectors: [["nz-footer"]],
    exportAs: ["nzFooter"],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function NzFooterComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzFooterComponent, [{
    type: Component,
    args: [{
      selector: "nz-footer",
      exportAs: "nzFooter",
      template: `<ng-content></ng-content>`,
      preserveWhitespaces: false,
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: Renderer2
  }], null);
})();
var NzHeaderComponent = class _NzHeaderComponent {
  elementRef;
  renderer;
  constructor(elementRef, renderer) {
    this.elementRef = elementRef;
    this.renderer = renderer;
    this.renderer.addClass(this.elementRef.nativeElement, "ant-layout-header");
  }
  static ɵfac = function NzHeaderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzHeaderComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzHeaderComponent,
    selectors: [["nz-header"]],
    exportAs: ["nzHeader"],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function NzHeaderComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzHeaderComponent, [{
    type: Component,
    args: [{
      selector: "nz-header",
      exportAs: "nzHeader",
      template: `<ng-content></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      preserveWhitespaces: false
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: Renderer2
  }], null);
})();
var NzSiderTriggerComponent = class _NzSiderTriggerComponent {
  nzCollapsed = false;
  nzReverseArrow = false;
  nzZeroTrigger = null;
  nzTrigger = void 0;
  matchBreakPoint = false;
  nzCollapsedWidth = null;
  siderWidth = null;
  nzBreakpoint = null;
  isZeroTrigger = false;
  isNormalTrigger = false;
  updateTriggerType() {
    this.isZeroTrigger = this.nzCollapsedWidth === 0 && (this.nzBreakpoint && this.matchBreakPoint || !this.nzBreakpoint);
    this.isNormalTrigger = this.nzCollapsedWidth !== 0;
  }
  ngOnInit() {
    this.updateTriggerType();
  }
  ngOnChanges() {
    this.updateTriggerType();
  }
  static ɵfac = function NzSiderTriggerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSiderTriggerComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSiderTriggerComponent,
    selectors: [["", "nz-sider-trigger", ""]],
    hostVars: 10,
    hostBindings: function NzSiderTriggerComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵstyleProp("width", ctx.isNormalTrigger ? ctx.siderWidth : null);
        ɵɵclassProp("ant-layout-sider-trigger", ctx.isNormalTrigger)("ant-layout-sider-zero-width-trigger", ctx.isZeroTrigger)("ant-layout-sider-zero-width-trigger-right", ctx.isZeroTrigger && ctx.nzReverseArrow)("ant-layout-sider-zero-width-trigger-left", ctx.isZeroTrigger && !ctx.nzReverseArrow);
      }
    },
    inputs: {
      nzCollapsed: "nzCollapsed",
      nzReverseArrow: "nzReverseArrow",
      nzZeroTrigger: "nzZeroTrigger",
      nzTrigger: "nzTrigger",
      matchBreakPoint: "matchBreakPoint",
      nzCollapsedWidth: "nzCollapsedWidth",
      siderWidth: "siderWidth",
      nzBreakpoint: "nzBreakpoint"
    },
    exportAs: ["nzSiderTrigger"],
    features: [ɵɵNgOnChangesFeature],
    attrs: _c1,
    decls: 6,
    vars: 2,
    consts: [["defaultTrigger", ""], ["defaultZeroTrigger", ""], [3, "ngTemplateOutlet"], [3, "nzType"], ["nzType", "bars"]],
    template: function NzSiderTriggerComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, NzSiderTriggerComponent_Conditional_0_Template, 1, 1, null, 2)(1, NzSiderTriggerComponent_Conditional_1_Template, 1, 1, null, 2)(2, NzSiderTriggerComponent_ng_template_2_Template, 2, 1, "ng-template", null, 0, ɵɵtemplateRefExtractor)(4, NzSiderTriggerComponent_ng_template_4_Template, 1, 0, "ng-template", null, 1, ɵɵtemplateRefExtractor);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.isZeroTrigger ? 0 : -1);
        ɵɵadvance();
        ɵɵconditional(ctx.isNormalTrigger ? 1 : -1);
      }
    },
    dependencies: [NgTemplateOutlet, NzIconModule, NzIconDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSiderTriggerComponent, [{
    type: Component,
    args: [{
      selector: "[nz-sider-trigger]",
      exportAs: "nzSiderTrigger",
      preserveWhitespaces: false,
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    @if (isZeroTrigger) {
      <ng-template [ngTemplateOutlet]="nzZeroTrigger || defaultZeroTrigger" />
    }

    @if (isNormalTrigger) {
      <ng-template [ngTemplateOutlet]="nzTrigger || defaultTrigger" />
    }
    <ng-template #defaultTrigger>
      @if (nzReverseArrow) {
        <nz-icon [nzType]="nzCollapsed ? 'left' : 'right'" />
      } @else {
        <nz-icon [nzType]="nzCollapsed ? 'right' : 'left'" />
      }
    </ng-template>
    <ng-template #defaultZeroTrigger>
      <nz-icon nzType="bars" />
    </ng-template>
  `,
      host: {
        "[class.ant-layout-sider-trigger]": "isNormalTrigger",
        "[style.width]": "isNormalTrigger ? siderWidth : null",
        "[class.ant-layout-sider-zero-width-trigger]": "isZeroTrigger",
        "[class.ant-layout-sider-zero-width-trigger-right]": "isZeroTrigger && nzReverseArrow",
        "[class.ant-layout-sider-zero-width-trigger-left]": "isZeroTrigger && !nzReverseArrow"
      },
      imports: [NgTemplateOutlet, NzIconModule]
    }]
  }], null, {
    nzCollapsed: [{
      type: Input
    }],
    nzReverseArrow: [{
      type: Input
    }],
    nzZeroTrigger: [{
      type: Input
    }],
    nzTrigger: [{
      type: Input
    }],
    matchBreakPoint: [{
      type: Input
    }],
    nzCollapsedWidth: [{
      type: Input
    }],
    siderWidth: [{
      type: Input
    }],
    nzBreakpoint: [{
      type: Input
    }]
  });
})();
var NzSiderComponent = class _NzSiderComponent {
  platform;
  cdr;
  breakpointService;
  destroy$ = new Subject();
  nzMenuDirective = null;
  nzCollapsedChange = new EventEmitter();
  nzWidth = 200;
  nzTheme = "dark";
  nzCollapsedWidth = 80;
  nzBreakpoint = null;
  nzZeroTrigger = null;
  nzTrigger = void 0;
  nzReverseArrow = false;
  nzCollapsible = false;
  nzCollapsed = false;
  matchBreakPoint = false;
  flexSetting = null;
  widthSetting = null;
  updateStyleMap() {
    this.widthSetting = this.nzCollapsed ? `${this.nzCollapsedWidth}px` : toCssPixel(this.nzWidth);
    this.flexSetting = `0 0 ${this.widthSetting}`;
    this.cdr.markForCheck();
  }
  updateMenuInlineCollapsed() {
    if (this.nzMenuDirective && this.nzMenuDirective.nzMode === "inline" && this.nzCollapsedWidth !== 0) {
      this.nzMenuDirective.setInlineCollapsed(this.nzCollapsed);
    }
  }
  setCollapsed(collapsed) {
    if (collapsed !== this.nzCollapsed) {
      this.nzCollapsed = collapsed;
      this.nzCollapsedChange.emit(collapsed);
      this.updateMenuInlineCollapsed();
      this.updateStyleMap();
      this.cdr.markForCheck();
    }
  }
  constructor(platform, cdr, breakpointService) {
    this.platform = platform;
    this.cdr = cdr;
    this.breakpointService = breakpointService;
  }
  ngOnInit() {
    this.updateStyleMap();
    if (this.platform.isBrowser) {
      this.breakpointService.subscribe(siderResponsiveMap, true).pipe(takeUntil(this.destroy$)).subscribe((map) => {
        const breakpoint = this.nzBreakpoint;
        if (breakpoint) {
          inNextTick().subscribe(() => {
            this.matchBreakPoint = !map[breakpoint];
            this.setCollapsed(this.matchBreakPoint);
            this.cdr.markForCheck();
          });
        }
      });
    }
  }
  ngOnChanges(changes) {
    const {
      nzCollapsed,
      nzCollapsedWidth,
      nzWidth
    } = changes;
    if (nzCollapsed || nzCollapsedWidth || nzWidth) {
      this.updateStyleMap();
    }
    if (nzCollapsed) {
      this.updateMenuInlineCollapsed();
    }
  }
  ngAfterContentInit() {
    this.updateMenuInlineCollapsed();
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  static ɵfac = function NzSiderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSiderComponent)(ɵɵdirectiveInject(Platform), ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(NzBreakpointService));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSiderComponent,
    selectors: [["nz-sider"]],
    contentQueries: function NzSiderComponent_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, NzMenuDirective, 5);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.nzMenuDirective = _t.first);
      }
    },
    hostAttrs: [1, "ant-layout-sider"],
    hostVars: 18,
    hostBindings: function NzSiderComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵstyleProp("flex", ctx.flexSetting)("max-width", ctx.widthSetting)("min-width", ctx.widthSetting)("width", ctx.widthSetting);
        ɵɵclassProp("ant-layout-sider-zero-width", ctx.nzCollapsed && ctx.nzCollapsedWidth === 0)("ant-layout-sider-light", ctx.nzTheme === "light")("ant-layout-sider-dark", ctx.nzTheme === "dark")("ant-layout-sider-collapsed", ctx.nzCollapsed)("ant-layout-sider-has-trigger", ctx.nzCollapsible && ctx.nzTrigger !== null);
      }
    },
    inputs: {
      nzWidth: "nzWidth",
      nzTheme: "nzTheme",
      nzCollapsedWidth: "nzCollapsedWidth",
      nzBreakpoint: "nzBreakpoint",
      nzZeroTrigger: "nzZeroTrigger",
      nzTrigger: "nzTrigger",
      nzReverseArrow: [2, "nzReverseArrow", "nzReverseArrow", booleanAttribute],
      nzCollapsible: [2, "nzCollapsible", "nzCollapsible", booleanAttribute],
      nzCollapsed: [2, "nzCollapsed", "nzCollapsed", booleanAttribute]
    },
    outputs: {
      nzCollapsedChange: "nzCollapsedChange"
    },
    exportAs: ["nzSider"],
    features: [ɵɵNgOnChangesFeature],
    ngContentSelectors: _c0,
    decls: 3,
    vars: 1,
    consts: [[1, "ant-layout-sider-children"], ["nz-sider-trigger", "", 3, "matchBreakPoint", "nzCollapsedWidth", "nzCollapsed", "nzBreakpoint", "nzReverseArrow", "nzTrigger", "nzZeroTrigger", "siderWidth"], ["nz-sider-trigger", "", 3, "click", "matchBreakPoint", "nzCollapsedWidth", "nzCollapsed", "nzBreakpoint", "nzReverseArrow", "nzTrigger", "nzZeroTrigger", "siderWidth"]],
    template: function NzSiderComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵelementStart(0, "div", 0);
        ɵɵprojection(1);
        ɵɵelementEnd();
        ɵɵtemplate(2, NzSiderComponent_Conditional_2_Template, 1, 8, "div", 1);
      }
      if (rf & 2) {
        ɵɵadvance(2);
        ɵɵconditional(ctx.nzCollapsible && ctx.nzTrigger !== null ? 2 : -1);
      }
    },
    dependencies: [NzSiderTriggerComponent],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSiderComponent, [{
    type: Component,
    args: [{
      selector: "nz-sider",
      exportAs: "nzSider",
      preserveWhitespaces: false,
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <div class="ant-layout-sider-children">
      <ng-content></ng-content>
    </div>
    @if (nzCollapsible && nzTrigger !== null) {
      <div
        nz-sider-trigger
        [matchBreakPoint]="matchBreakPoint"
        [nzCollapsedWidth]="nzCollapsedWidth"
        [nzCollapsed]="nzCollapsed"
        [nzBreakpoint]="nzBreakpoint"
        [nzReverseArrow]="nzReverseArrow"
        [nzTrigger]="nzTrigger"
        [nzZeroTrigger]="nzZeroTrigger"
        [siderWidth]="widthSetting"
        (click)="setCollapsed(!nzCollapsed)"
      ></div>
    }
  `,
      host: {
        class: "ant-layout-sider",
        "[class.ant-layout-sider-zero-width]": `nzCollapsed && nzCollapsedWidth === 0`,
        "[class.ant-layout-sider-light]": `nzTheme === 'light'`,
        "[class.ant-layout-sider-dark]": `nzTheme === 'dark'`,
        "[class.ant-layout-sider-collapsed]": `nzCollapsed`,
        "[class.ant-layout-sider-has-trigger]": `nzCollapsible && nzTrigger !== null`,
        "[style.flex]": "flexSetting",
        "[style.maxWidth]": "widthSetting",
        "[style.minWidth]": "widthSetting",
        "[style.width]": "widthSetting"
      },
      imports: [NzSiderTriggerComponent]
    }]
  }], () => [{
    type: Platform
  }, {
    type: ChangeDetectorRef
  }, {
    type: NzBreakpointService
  }], {
    nzMenuDirective: [{
      type: ContentChild,
      args: [NzMenuDirective]
    }],
    nzCollapsedChange: [{
      type: Output
    }],
    nzWidth: [{
      type: Input
    }],
    nzTheme: [{
      type: Input
    }],
    nzCollapsedWidth: [{
      type: Input
    }],
    nzBreakpoint: [{
      type: Input
    }],
    nzZeroTrigger: [{
      type: Input
    }],
    nzTrigger: [{
      type: Input
    }],
    nzReverseArrow: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzCollapsible: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzCollapsed: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var NzLayoutComponent = class _NzLayoutComponent {
  directionality;
  listOfNzSiderComponent;
  dir = "ltr";
  destroy$ = new Subject();
  constructor(directionality) {
    this.directionality = directionality;
  }
  ngOnInit() {
    this.dir = this.directionality.value;
    this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
      this.dir = direction;
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  static ɵfac = function NzLayoutComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzLayoutComponent)(ɵɵdirectiveInject(Directionality));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzLayoutComponent,
    selectors: [["nz-layout"]],
    contentQueries: function NzLayoutComponent_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, NzSiderComponent, 4);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.listOfNzSiderComponent = _t);
      }
    },
    hostAttrs: [1, "ant-layout"],
    hostVars: 4,
    hostBindings: function NzLayoutComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("ant-layout-rtl", ctx.dir === "rtl")("ant-layout-has-sider", ctx.listOfNzSiderComponent.length > 0);
      }
    },
    exportAs: ["nzLayout"],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function NzLayoutComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzLayoutComponent, [{
    type: Component,
    args: [{
      selector: "nz-layout",
      exportAs: "nzLayout",
      template: `<ng-content></ng-content>`,
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      preserveWhitespaces: false,
      host: {
        class: "ant-layout",
        "[class.ant-layout-rtl]": `dir === 'rtl'`,
        "[class.ant-layout-has-sider]": "listOfNzSiderComponent.length > 0"
      }
    }]
  }], () => [{
    type: Directionality
  }], {
    listOfNzSiderComponent: [{
      type: ContentChildren,
      args: [NzSiderComponent]
    }]
  });
})();
var NzLayoutModule = class _NzLayoutModule {
  static ɵfac = function NzLayoutModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzLayoutModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzLayoutModule,
    imports: [NzLayoutComponent, NzHeaderComponent, NzContentComponent, NzFooterComponent, NzSiderComponent, NzSiderTriggerComponent],
    exports: [NzLayoutComponent, NzHeaderComponent, NzContentComponent, NzFooterComponent, NzSiderComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [NzSiderComponent, NzSiderTriggerComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzLayoutModule, [{
    type: NgModule,
    args: [{
      imports: [NzLayoutComponent, NzHeaderComponent, NzContentComponent, NzFooterComponent, NzSiderComponent, NzSiderTriggerComponent],
      exports: [NzLayoutComponent, NzHeaderComponent, NzContentComponent, NzFooterComponent, NzSiderComponent]
    }]
  }], null, null);
})();
export {
  NzContentComponent,
  NzFooterComponent,
  NzHeaderComponent,
  NzLayoutComponent,
  NzLayoutModule,
  NzSiderComponent,
  NzSiderTriggerComponent as ɵNzSiderTriggerComponent
};
//# sourceMappingURL=ng-zorro-antd_layout.js.map
