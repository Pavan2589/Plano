import {
  Directive,
  ElementRef,
  Input,
  NgModule,
  Renderer2,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject
} from "./chunk-WPBYGH2V.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-transition-patch.mjs
var NzTransitionPatchDirective = class _NzTransitionPatchDirective {
  elementRef;
  renderer;
  hidden = null;
  setHiddenAttribute() {
    if (this.hidden) {
      if (typeof this.hidden === "string") {
        this.renderer.setAttribute(this.elementRef.nativeElement, "hidden", this.hidden);
      } else {
        this.renderer.setAttribute(this.elementRef.nativeElement, "hidden", "");
      }
    } else {
      this.renderer.removeAttribute(this.elementRef.nativeElement, "hidden");
    }
  }
  constructor(elementRef, renderer) {
    this.elementRef = elementRef;
    this.renderer = renderer;
    this.renderer.setAttribute(this.elementRef.nativeElement, "hidden", "");
  }
  ngOnChanges() {
    this.setHiddenAttribute();
  }
  ngAfterViewInit() {
    this.setHiddenAttribute();
  }
  static ɵfac = function NzTransitionPatchDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzTransitionPatchDirective)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2));
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzTransitionPatchDirective,
    selectors: [["", "nz-button", ""], ["nz-button-group"], ["", "nz-icon", ""], ["nz-icon"], ["", "nz-menu-item", ""], ["", "nz-submenu", ""], ["nz-select-top-control"], ["nz-select-placeholder"], ["nz-input-group"]],
    inputs: {
      hidden: "hidden"
    },
    features: [ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzTransitionPatchDirective, [{
    type: Directive,
    args: [{
      selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group"
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: Renderer2
  }], {
    hidden: [{
      type: Input
    }]
  });
})();
var NzTransitionPatchModule = class _NzTransitionPatchModule {
  static ɵfac = function NzTransitionPatchModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzTransitionPatchModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzTransitionPatchModule,
    imports: [NzTransitionPatchDirective],
    exports: [NzTransitionPatchDirective]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzTransitionPatchModule, [{
    type: NgModule,
    args: [{
      imports: [NzTransitionPatchDirective],
      exports: [NzTransitionPatchDirective]
    }]
  }], null, null);
})();

export {
  NzTransitionPatchDirective,
  NzTransitionPatchModule
};
//# sourceMappingURL=chunk-ZEP5UJB6.js.map
