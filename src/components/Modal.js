export default class Modal {
  constructor({ $target }) {
    this.$target = $target;
    this.$modalContainer = this.createModal();
    this.data = null;
  }

  createModal() {
    const $modalContainer = document.createElement("div");
    $modalContainer.className = "modal-container hidden";

    const $modalBackground = document.createElement("div");
    $modalBackground.className = "modal__background";
    $modalBackground.addEventListener("click", () => {
      this.closeModal();
    });

    const $modalContent = document.createElement("div");
    $modalContent.className = "modal__content hidden";

    const $modalCloseBtn = document.createElement("button");
    $modalCloseBtn.className = "modal-content__close";
    $modalCloseBtn.innerHTML = '<i class="fas fa-times"></i>';
    $modalCloseBtn.addEventListener("click", () => {
      this.closeModal();
    });

    const $modalTitle = document.createElement("span");
    $modalTitle.className = "modal-content__title";

    const $modalText = document.createElement("ul");
    $modalText.className = "modal-content__text hidden";

    const $modalHTML = document.createElement("div");
    $modalHTML.className = "modal-content__html hidden";

    const $modalOkBtn = document.createElement("button");
    $modalOkBtn.className = "modal-content__ok";
    $modalOkBtn.textContent = "Continue";

    $modalContent.appendChild($modalCloseBtn);
    $modalContent.appendChild($modalTitle);
    $modalContent.appendChild($modalText);
    $modalContent.appendChild($modalHTML);
    $modalContent.appendChild($modalOkBtn);
    $modalContainer.appendChild($modalBackground);
    $modalContainer.appendChild($modalContent);
    this.$target.appendChild($modalContainer);

    return $modalContainer;
  }

  renderModal() {
    const { title, text, html, onContinue } = this.data;

    const $modalTitle = this.$modalContainer.querySelector(
      ".modal-content__title"
    );
    $modalTitle.textContent = title;

    if (text) {
      const $modalText = this.$modalContainer.querySelector(
        ".modal-content__text"
      );

      $modalText.classList.remove("hidden");

      text.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        $modalText.appendChild(li);
      });
    }

    if (html) {
      const { data, type } = html;

      const $modalHTML = this.$modalContainer.querySelector(
        ".modal-content__html"
      );

      $modalHTML.classList.remove("hidden");

      if (type === "string") {
        $modalHTML.innerHTML = data;
      } else if (type === "element") {
        $modalHTML.appendChild(data);
      }
    }

    const $modalOkBtn = this.$modalContainer.querySelector(
      ".modal-content__ok"
    );
    $modalOkBtn.addEventListener("click", () => {
      this.closeModal();
      onContinue();
    });
  }

  closeModal() {
    this.$modalContainer.classList.add("hidden");

    const $modalContent = this.$modalContainer.querySelector(".modal__content");
    $modalContent.classList.add("hidden");

    $modalContent.querySelector(".modal-content__title").textContent = "";
    $modalContent.querySelector(".modal-content__text").innerHTML = "";
    $modalContent.querySelector(".modal-content__html").innerHTML = "";

    $modalContent.querySelector(".modal-content__text").classList.add("hidden");
    $modalContent.querySelector(".modal-content__html").classList.add("hidden");

    const $okBtn = $modalContent.querySelector(".modal-content__ok");
    $okBtn.outerHTML = $okBtn.outerHTML;
  }

  setState(nextData) {
    this.data = nextData; // title, text, html, onContinue

    const modal = this.$modalContainer;
    modal.classList.remove("hidden");

    const modalContent = modal.querySelector(".modal__content");
    modalContent.classList.remove("hidden");

    this.renderModal();
  }
}
