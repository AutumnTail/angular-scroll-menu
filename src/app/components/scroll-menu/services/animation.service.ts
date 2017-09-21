import { Injectable } from '@angular/core';
import { Easings, EasingFunctions, HTMLElementProperty } from './animations';

@Injectable()
export class AnimationService {

  private _animating: boolean;

  constructor() { }

  /**
   * Animates an element using an easing function for a set duration using request animation frame.
   *
   * @param element: HTMLElement - The HTML element that should animate
   * @param property: HTMLElementProperty - The HTML element property that should animate
   * @param end: number - The end value the element should animate to
   * @param duration: number - The duration the element should animate for to the end
   * @param easing: EasingFunction - The type of easing function that should be used
   * @param callback?: Callback returned after the animation is complete
   */
  public animate(element: HTMLElement, property: HTMLElementProperty, end: number, duration: number, easing: EasingFunctions, cancelled?: () => void, complete?: () => void) {
    if (property == HTMLElementProperty.scrollLeft) {
      if (element.scrollLeft == end) return complete != null ? complete() : null;
    }

    this._animating = true;
    let time_start = 'now' in window.performance ? performance.now() : new Date().getTime();
    let start_left = element.scrollLeft;
    let min_left = 0;
    let max_left = element.scrollWidth - element.clientWidth;
    let raf;
    easing = easing != null ? easing : EasingFunctions.linear;

    let animate = () => {
      let time = 'now' in window.performance ? performance.now() : new Date().getTime();
      let animation_time = Math.min(1, ((time - time_start) / duration));
      let easing_time = Easings.getTime(easing, animation_time);

      if (property == HTMLElementProperty.scrollLeft) {
        element.scrollLeft = Math.ceil((easing_time * (end - start_left)) + start_left);
      }

      if (animation_time == 1) {
        if (property == HTMLElementProperty.scrollLeft) {
          element.scrollLeft = end;
        }
        window.cancelAnimationFrame(raf);
        return complete != null ? complete() : null;
      }
      else {
        if (this._animating) {
          raf = window.requestAnimFrame(animate)
        }
        else {
          window.cancelAnimationFrame(raf);
          return cancelled != null ? cancelled() : null;
        }
      }
    }
    window.requestAnimFrame(animate);
  }

  public cancel() {
    this._animating = false;
  }

  public isAnimating() {
    return this._animating;
  }
}
