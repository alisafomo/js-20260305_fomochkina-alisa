import { createElement } from "../../shared/utils/create-element";

interface Options {
  duration?: number;
  type?: 'success' | 'error';
 }

export default class NotificationMessage {
  public element: HTMLElement;
  public static activeNotificationMessage: NotificationMessage | null;

  private message: string;
  private duration: number;
  private type: 'success' | 'error'

  constructor(message: string, {duration=2000, type='success' }: Options = {}) {
    if (NotificationMessage.activeNotificationMessage) {
      NotificationMessage.activeNotificationMessage.remove();
    }
    this.duration = duration;
    this.type = type;
    this.message = message;
    this.element = createElement(this.template);

    NotificationMessage.activeNotificationMessage = this;
  }

  private get template(){
    return `
        <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
          <div class="timer"></div>
          <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
              ${this.message}
            </div>
          </div>
        </div>
    `;
  }

  public show(target = document.body){
    target.append(this.element);
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  public remove(){
    if (this.element){
      this.element.remove();
    }
  }

  public destroy(){
    this.remove();
    if (NotificationMessage.activeNotificationMessage === this){
      NotificationMessage.activeNotificationMessage = null;
    }
  }
}
