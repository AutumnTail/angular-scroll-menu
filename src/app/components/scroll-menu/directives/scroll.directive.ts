import { Directive, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { AnimationService } from '../services/animation.service';
import { HTMLElementProperty, EasingFunctions } from '../services/animations';

@Directive({
  selector: '[scroller]',
  providers: [AnimationService]
})
export class ScrollDirective implements OnInit, OnDestroy {

  startTime: number;
  startX: number;
  startScrollLeft: number;
  listeners: Array<Function> = new Array<Function>();

  constructor(private elementRef: ElementRef, private renderer: Renderer2, private animationService: AnimationService) {
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "mousedown", (e) => this._onDragStart(e)));
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "touchstart", (e) => this._onDragStart(e)));
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "mousemove", (e) => this._onDragging(e)));
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "touchmove", (e) => this._onDragging(e)));
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "mouseup", (e) => this._onDragEnd(e)));
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "mouseout", (e) => this._onDragEnd(e)));
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "touchend", (e) => this._onDragEnd(e)));
    this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, "touchcancel", (e) => this._onDragEnd(e)));
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.listeners.forEach(listener => {
      listener();
    });
  }

  _onDragStart(e) {
    this.animationService.cancel();
    this.startX = this._getX(e);
    this.startScrollLeft = this.elementRef.nativeElement.scrollLeft;
    this.startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
  }

  _onDragging(e) {
    if (this.startX == null) return;
    let deltaX = this.startX - this._getX(e);
    let scrollLeft = this.startScrollLeft + deltaX;
    this.elementRef.nativeElement.scrollLeft = scrollLeft;
  }

  _onDragEnd(e) {
    if (this.startX == null) return;
    let deltaX = this.startX - this._getX(e);
    let deltaTime = Math.abs('now' in window.performance ? performance.now() : new Date().getTime() - this.startTime);
    let scrollLeft = this.elementRef.nativeElement.scrollLeft + deltaX;
    this.animationService.animate(this.elementRef.nativeElement, HTMLElementProperty.scrollLeft, scrollLeft, 1000, EasingFunctions.easeOutQuad);
    this.startX = null;
    this.startScrollLeft = null;
  }

  _getX(e: MouseEvent | TouchEvent) {
    if (this._isTouchEvent(e)) {
      e = e as TouchEvent;
      let touch = e.changedTouches[0];
      return touch.pageX;
    } else {
      e = e as MouseEvent;
      return e.pageX;
    }
  }

  _isTouchEvent(e: TouchEvent | MouseEvent) {
    let mouseEvents = ["touchstart", "touchmove", "touchend", "touchcancel"]
    return mouseEvents.indexOf(e.type) != -1;
  }
}
