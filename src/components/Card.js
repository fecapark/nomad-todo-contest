import { CardStorage, TagStorage } from "../utils/CustomStorage.js";
import { Hash } from "../utils/Hash.js";

export default class Card {
  constructor(
    { tag, countdown, text, updatedAt, cardComponent, salt, id },
    isComplete = false
  ) {
    this.tag = tag;
    this.countdown = countdown;
    this.text = text;
    this.updatedAt = updatedAt || this.getCurTime();
    this.cardComponent = cardComponent;
    this.salt = salt || Hash.getSalt();
    this.id = id || Hash.createHash(text + this.tag.join("") + this.salt);
    this.element = this.createCardElement(isComplete);
  }

  getCurTime() {
    const time = new Date();

    const year = `${time.getFullYear()}`;
    let month = time.getMonth() + 1;
    let date = time.getDate();
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();

    if (month < 10) month = `0${month}`;
    if (date < 10) date = `0${date}`;
    if (hour < 10) hour = `0${hour}`;
    if (min < 10) min = `0${min}`;
    if (sec < 10) sec = `0${sec}`;

    return `${year}/${month}/${date}T${hour}:${min}:${sec}`;
  }

  createCardElement(isComplete) {
    function createTag(tag, r, g, b, inThumb = false) {
      const $tag = document.createElement("div");
      $tag.className = "tag";
      $tag.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;

      const $tagSpan = document.createElement("span");
      $tagSpan.className = "tag__span";
      $tagSpan.textContent = "#" + tag;

      $tag.appendChild($tagSpan);

      if (!inThumb) {
        const $tagRemoveButton = document.createElement("button");
        $tagRemoveButton.className = "tag__remove";
        $tagRemoveButton.innerHTML = '<i class="fas fa-times"></i>';
        $tagRemoveButton.addEventListener("click", () => {
          $tagInnerContainer.removeChild($tag);
        });

        $tag.appendChild($tagRemoveButton);
      }

      return $tag;
    }

    function spliceCardFromToDo($card, cardComponent) {
      const todoCards = cardComponent.cards.todo;
      let cardIdx = -1;

      for (let i = 0; i < todoCards.length; i++) {
        if (todoCards[i].element === $card) {
          cardIdx = i;
          break;
        }
      }

      return todoCards.splice(cardIdx, 1)[0];
    }

    function spliceCardFromComplete($card, cardComponent) {
      const completeCards = cardComponent.cards.complete;
      let cardIdx = -1;

      for (let i = 0; i < completeCards.length; i++) {
        if (completeCards[i].element === $card) {
          cardIdx = i;
          break;
        }
      }

      return completeCards.splice(cardIdx, 1)[0];
    }

    function toggleMenuButtonEL_click(e) {
      let $toggleMenuButton = e.target;

      if (!$toggleMenuButton.matches(".toggle")) {
        $toggleMenuButton = $toggleMenuButton.parentNode;
      }

      const $cardMenuContainer = $toggleMenuButton.parentNode;

      if ($cardMenuContainer.classList.contains("active")) {
        $toggleMenuButton.blur();
        $cardMenuContainer.classList.remove("active");
        $toggleMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
      } else {
        $cardMenuContainer.classList.add("active");
        $toggleMenuButton.innerHTML = '<i class="fas fa-times"></i>';
      }
    }

    function toggleMenuButtonEL_focusout(e) {
      let $toggleMenuButton = e.target;
      if (!$toggleMenuButton.matches(".toggle")) {
        $toggleMenuButton = $toggleMenuButton.parentNode;
      }
      const $cardMenuContainer = $toggleMenuButton.parentNode;
      $cardMenuContainer.classList.remove("active");
      $toggleMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    }

    function resendButtonEL(e) {
      e.stopPropagation();

      let $target = e.target;

      if (e.target.classList.contains("fas")) {
        $target = $target.parentNode;
      }

      const $card = $target.parentNode.parentNode;
      const card = spliceCardFromComplete($card, this.cardComponent);
      card.element = $card.cloneNode(true);

      card.element.classList.remove("complete");
      const $cardMenuContainer = card.element.querySelector(
        ".card__menu-container"
      );
      $cardMenuContainer.classList.remove("active");

      const $toggleBtn = $cardMenuContainer.querySelector(".toggle");
      $toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      $toggleBtn.addEventListener("click", toggleMenuButtonEL_click);
      $toggleBtn.addEventListener("focusout", toggleMenuButtonEL_focusout);

      const $resendButton = $cardMenuContainer.querySelector(".resend");
      $resendButton.remove();

      const $deleteButton = $cardMenuContainer.querySelector(".delete");
      $deleteButton.remove();

      const $completeButton = document.createElement("button");
      $completeButton.className = "card-menu complete";
      $completeButton.innerHTML = '<i class="fas fa-check"></i>';
      $completeButton.addEventListener(
        "mousedown",
        completeButtonEL.bind(this)
      );

      const $editButton = document.createElement("button");
      $editButton.className = "card-menu edit";
      $editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
      $editButton.title = "Edit";

      const $newDeleteButton = document.createElement("button");
      $newDeleteButton.className = "card-menu delete";
      $newDeleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      $newDeleteButton.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        let $target = e.target;

        if (e.target.classList.contains("fas")) {
          $target = $target.parentNode;
        }

        const $card = $target.parentNode.parentNode;
        const id = $card.id;

        TagStorage.removeCardId(id);
        CardStorage.removeCardFromTodo(id);

        spliceCardFromToDo($card, this.cardComponent);
        $card.parentNode.removeChild($card);
      });

      $cardMenuContainer.appendChild($completeButton);
      $cardMenuContainer.appendChild($editButton);
      $cardMenuContainer.appendChild($newDeleteButton);

      this.cardComponent.cards.todo.unshift(card);

      $card.classList.add("remove");

      CardStorage.addCardToTodo(card);
      CardStorage.removeCardFromComplete(card.id);

      const { todo, complete } = this.cardComponent.cards;
      this.cardComponent.profileComponent.setProgress(
        complete.length,
        todo.length + complete.length
      );

      setTimeout(() => {
        $card.classList.remove("remove");
        $card.remove();
      }, 600);
    }

    function completeButtonEL(e) {
      e.stopPropagation();

      let $target = e.target;

      if (e.target.classList.contains("fas")) {
        $target = $target.parentNode;
      }

      const $card = $target.parentNode.parentNode;
      const card = spliceCardFromToDo($card, this.cardComponent);
      card.element = $card.cloneNode(true);

      card.element.classList.add("complete");
      const $cardMenuContainer = card.element.querySelector(
        ".card__menu-container"
      );
      $cardMenuContainer.classList.remove("active");

      const $toggleBtn = $cardMenuContainer.querySelector(".toggle");
      $toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      $toggleBtn.addEventListener("click", toggleMenuButtonEL_click);
      $toggleBtn.addEventListener("focusout", toggleMenuButtonEL_focusout);

      const $completeButton = $cardMenuContainer.querySelector(".complete");
      $completeButton.remove();

      const $editButton = $cardMenuContainer.querySelector(".edit");
      $editButton.remove();

      const $deleteButton = $cardMenuContainer.querySelector(".delete");
      $deleteButton.remove();

      console.log(card.element, $cardMenuContainer);

      const $resendButton = document.createElement("button");
      $resendButton.className = "card-menu resend";
      $resendButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
      $resendButton.addEventListener("mousedown", resendButtonEL.bind(this));

      const $newDeleteButton = document.createElement("button");
      $newDeleteButton.className = "card-menu delete";
      $newDeleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      $newDeleteButton.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        let $target = e.target;

        if (e.target.classList.contains("fas")) {
          $target = $target.parentNode;
        }

        const $card = $target.parentNode.parentNode;
        const id = $card.id;

        TagStorage.removeCardId(id);
        CardStorage.removeCardFromComplete(id);

        spliceCardFromComplete($card, this.cardComponent);
        $card.parentNode.removeChild($card);
      });

      $cardMenuContainer.appendChild($resendButton);
      $cardMenuContainer.appendChild($newDeleteButton);

      this.cardComponent.cards.complete.unshift(card);

      $card.classList.add("remove");

      CardStorage.addCardToComplete(card);
      CardStorage.removeCardFromTodo(card.id);

      const { todo, complete } = this.cardComponent.cards;
      this.cardComponent.profileComponent.setProgress(
        complete.length,
        todo.length + complete.length
      );

      setTimeout(() => {
        $card.classList.remove("remove");
        $card.remove();
      }, 600);
    }

    const $card = document.createElement("div");
    $card.className = "card";
    $card.id = this.id;

    const $cardText = document.createElement("div");
    $cardText.className = "card__text";
    $cardText.textContent = this.text;

    const $cardTagContainer = document.createElement("div");
    $cardTagContainer.className = "card__tag-container";

    if (this.tag.length === 0) {
      $cardTagContainer.textContent = "No Tags";
    } else {
      this.tag.forEach((tag) => {
        const tagObj = TagStorage.getTagObj(tag);
        const { r, g, b } = tagObj;

        const $tag = createTag(tag, r, g, b, true);

        $cardTagContainer.appendChild($tag);
      });
    }

    const $cardCountdown = document.createElement("div");
    $cardCountdown.className = "card__countdown";
    if (this.countdown) {
      $cardCountdown.textContent = `${this.countdown.hour}H ${this.countdown.min}M Left`;
    } else {
      $cardCountdown.textContent = "Whenever";
    }

    const $cardMenuContainer = document.createElement("div");
    $cardMenuContainer.className = "card__menu-container";

    if (!isComplete) {
      const $toggleMenuButton = document.createElement("button");
      $toggleMenuButton.className = "card-menu toggle";
      $toggleMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
      $toggleMenuButton.addEventListener("click", toggleMenuButtonEL_click);
      $toggleMenuButton.addEventListener(
        "focusout",
        toggleMenuButtonEL_focusout
      );

      const $completeButton = document.createElement("button");
      $completeButton.className = "card-menu complete";
      $completeButton.innerHTML = '<i class="fas fa-check"></i>';
      $completeButton.title = "Complete";
      $completeButton.addEventListener(
        "mousedown",
        completeButtonEL.bind(this)
      );

      const $editButton = document.createElement("button");
      $editButton.className = "card-menu edit";
      $editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
      $editButton.title = "Edit";

      const $deleteButton = document.createElement("button");
      $deleteButton.className = "card-menu delete";
      $deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      $deleteButton.title = "Delete";
      $deleteButton.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        let $target = e.target;

        if (e.target.classList.contains("fas")) {
          $target = $target.parentNode;
        }

        const $card = $target.parentNode.parentNode;
        const id = $card.id;

        TagStorage.removeCardId(id);
        CardStorage.removeCardFromTodo(id);

        spliceCardFromToDo($card, this.cardComponent);
        $card.parentNode.removeChild($card);
      });

      $cardMenuContainer.appendChild($toggleMenuButton);
      $cardMenuContainer.appendChild($completeButton);
      $cardMenuContainer.appendChild($editButton);
      $cardMenuContainer.appendChild($deleteButton);
    } else {
      $card.classList.add("complete");

      const $toggleMenuButton = document.createElement("button");
      $toggleMenuButton.className = "card-menu toggle";
      $toggleMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
      $toggleMenuButton.addEventListener("click", toggleMenuButtonEL_click);
      $toggleMenuButton.addEventListener(
        "focusout",
        toggleMenuButtonEL_focusout
      );

      const $resendButton = document.createElement("button");
      $resendButton.className = "card-menu resend";
      $resendButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
      $resendButton.title = "Resend";
      $resendButton.addEventListener("mousedown", resendButtonEL.bind(this));

      const $deleteButton = document.createElement("button");
      $deleteButton.className = "card-menu delete";
      $deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      $deleteButton.title = "Delete";
      $deleteButton.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        let $target = e.target;

        if (e.target.classList.contains("fas")) {
          $target = $target.parentNode;
        }

        const $card = $target.parentNode.parentNode;
        const id = $card.id;

        TagStorage.removeCardId(id);
        CardStorage.removeCardFromComplete(id);

        spliceCardFromComplete($card, this.cardComponent);
        $card.parentNode.removeChild($card);
      });

      $cardMenuContainer.appendChild($toggleMenuButton);
      $cardMenuContainer.appendChild($resendButton);
      $cardMenuContainer.appendChild($deleteButton);
    }

    $card.appendChild($cardCountdown);
    $card.appendChild($cardText);
    $card.appendChild($cardTagContainer);
    $card.appendChild($cardMenuContainer);

    return $card;
  }
}
