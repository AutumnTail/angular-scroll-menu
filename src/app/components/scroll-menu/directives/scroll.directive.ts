import { Directive, ElementRef, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';
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
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.listeners.forEach(listener => {
      listener();
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this._onDragging(e);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e) {
    this._onDragEnd(e);
  }

  @HostListener('document:mousecancel', ['$event'])
  onMouseCancel(e) {
    this._onDragEnd(e);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(e) {
    this._onDragging(e);
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(e) {
    this._onDragEnd(e);
  }

  @HostListener('document:touchcancel', ['$event'])
  onTouchCancel(e) {
    this._onDragEnd(e);
  }

  _onDragStart(e: MouseEvent | TouchEvent) {
    this.animationService.cancel();
    this.startX = this._getX(e);
    this.startScrollLeft = this.elementRef.nativeElement.scrollLeft;
    this.startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
    e.stopPropagation();
    e.preventDefault();
  }

  _onDragging(e: MouseEvent | TouchEvent) {
    if (this.startX == null) return;
    let deltaX = this.startX - this._getX(e);
    let scrollLeft = this.startScrollLeft + deltaX;
    this.elementRef.nativeElement.scrollLeft = scrollLeft;
    e.stopPropagation();
    e.preventDefault();
  }

  _onDragEnd(e: MouseEvent | TouchEvent) {
    if (this.startX == null) return;
    let deltaX = this.startX - this._getX(e);
    let deltaTime = Math.abs('now' in window.performance ? performance.now() : new Date().getTime() - this.startTime);
    let scrollLeft = this.elementRef.nativeElement.scrollLeft + deltaX;
    this.animationService.animate(this.elementRef.nativeElement, HTMLElementProperty.scrollLeft, scrollLeft, 1000, EasingFunctions.easeOutQuad);
    this.startX = null;
    this.startScrollLeft = null;
    e.stopPropagation();
    e.preventDefault();
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
