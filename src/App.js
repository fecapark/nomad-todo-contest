import LoginComponent from "./components/LoginComponent.js";
import ProfileComponent from "./components/ProfileComponent.js";
import CardComponent from "./components/CardComponent.js";
import Modal from "./components/Modal.js";

export default class App {
  constructor($target) {
    this.$target = $target;
    this.$innerContainer = this.createInnerContainer();

    this.modal = new Modal({ $target });
    this.profileComponent = new ProfileComponent({
      $target: this.$innerContainer,
      modal: this.modal,
    });
    this.cardComponent = new CardComponent({
      $target: this.$innerContainer,
      modal: this.modal,
    });
    this.loginComponent = new LoginComponent({
      $target,
      profileComponent: this.profileComponent,
      cardComponent: this.cardComponent,
    });
  }

  createInnerContainer() {
    const $innerContainer = document.createElement("div");
    $innerContainer.className = "inner-container";
    $innerContainer.classList.add("hidden");

    this.$target.appendChild($innerContainer);

    return $innerContainer;
  }
}
