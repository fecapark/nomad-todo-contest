import { TagStorage, CardStorage } from "../utils/CustomStorage.js";
import Card from "./Card.js";

export default class CardComponent {
  constructor({ $target, modal }) {
    this.$target = $target;
    this.modal = modal;
    this.cards = {
      todo: this.initTodoCards.bind(this)(),
      complete: this.initCompleteCards.bind(this)(),
    };
    this.activeSection = "todos";
    this.profileComponent = null;
  }

  searchCard(e, isChangeSection = false) {
    let copyCards;
    const $allCardContainer = document.querySelector(".all-card-container");
    const $searchBar = document.querySelector(".filter__search-bar");
    const text = $searchBar.value;

    if (!$allCardContainer.matches(".complete")) {
      copyCards = [...this.cards.todo];
    } else {
      copyCards = [...this.cards.complete];
    }

    if (text.length === 0) {
      $allCardContainer.innerHTML = "";

      copyCards.forEach((card) => {
        card.element.classList.remove("searched");
        $allCardContainer.appendChild(card.element);
      });

      if (copyCards.length === 0) {
        const $emptySignSpan = document.createElement("span");
        $emptySignSpan.className = "empty-sign";
        $emptySignSpan.textContent = "No Cards";
        $allCardContainer.appendChild($emptySignSpan);
      }

      return;
    }

    copyCards = copyCards.filter((card) => {
      const cardText = card.text;

      for (let i = 0; i < text.length; i++) {
        const c = text[i];

        if (cardText.indexOf(c) === -1) {
          return false;
        }
      }

      if (text.length > cardText.length) return false;

      return true;
    });

    $allCardContainer.innerHTML = "";
    if (copyCards.length === 0) {
      const $emptySignSpan = document.createElement("span");
      $emptySignSpan.className = "empty-sign";
      $emptySignSpan.textContent = "No Results";
      $allCardContainer.appendChild($emptySignSpan);
    } else {
      copyCards.sort((a, b) => {
        return a.text.indexOf(text[0]) - b.text.indexOf(text[0]);
      });

      copyCards.forEach((card) => {
        if (!isChangeSection) {
          card.element.classList.add("searched");
        } else {
          card.element.classList.remove("searched");
        }
        $allCardContainer.appendChild(card.element);
      });
    }
  }

  setHeightSize($cardContainer) {
    const brect = $cardContainer.getBoundingClientRect();
    const bodyHeight = document.body.getBoundingClientRect().height;

    $cardContainer.style.height = `${bodyHeight - brect.top - 30}px`;
  }

  initTodoCards() {
    let todo = [];
    const todoCards = CardStorage.getAllCardFromTodo();

    todoCards.forEach((todoCard) => {
      const $cardElement = document.createElement("div");
      $cardElement.className = "card";
      $cardElement.id = todoCard.id;
      $cardElement.innerHTML = todoCard.element;

      const newCard = new Card({
        tag: todoCard.tag,
        countdown: todoCard.countdown,
        text: todoCard.text,
        updatedAt: todoCard.updatedAt,
        createdAt: todoCard.createdAt,
        cardComponent: this,
        salt: todoCard.salt,
        id: todoCard.id,
        modal: this.modal,
      });

      todo.push(newCard);
    });

    return todo;
  }

  initCompleteCards() {
    let complete = [];
    const completeCards = CardStorage.getAllCardFromComplete();

    completeCards.forEach((completeCard) => {
      const $cardElement = document.createElement("div");
      $cardElement.className = "card";
      $cardElement.id = completeCard.id;
      $cardElement.innerHTML = completeCard.element;

      const newCard = new Card(
        {
          tag: completeCard.tag,
          countdown: completeCard.countdown,
          text: completeCard.text,
          updatedAt: completeCard.updatedAt,
          createdAt: completeCard.createdAt,
          cardComponent: this,
          salt: completeCard.salt,
          id: completeCard.id,
          modal: this.modal,
        },
        true
      );

      const $countdown = newCard.element.querySelector(".card__countdown");
      $countdown.innerHTML = "Complete";
      $countdown.classList.add("complete");

      complete.push(newCard);
    });

    return complete;
  }

  createCardContainer() {
    const $cardContainer = document.createElement("main");
    $cardContainer.className = "card-container hidden";

    const $addCardButton = document.createElement("button");
    $addCardButton.className = "add-card-button";
    $addCardButton.innerHTML =
      '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>';

    $addCardButton.addEventListener("click", () => {
      $addCardButton.blur();
      const $sender = document.createElement("div");
      $sender.className = "sender";

      const $tagContainer = this.createTagContainer();
      const $countdownContainer = this.createCountdownContainer();
      const $todoInputContainer = this.createToDoContainer();

      $sender.appendChild($tagContainer);
      $sender.appendChild($countdownContainer);
      $sender.appendChild($todoInputContainer);

      this.modal.setState({
        title: "Add Card",
        html: {
          data: $sender,
          type: "element",
        },
        onContinue: () => {
          const $tags = $tagContainer
            .querySelector(".tag-inner-container")
            .querySelectorAll(".tag");
          const tags = [].slice
            .call($tags)
            .map(($tag) =>
              $tag.querySelector(".tag__span").textContent.slice(1)
            );

          const isActive = $countdownContainer
            .querySelector(".countdown__active-circle")
            .classList.contains("active");
          let countdown = null;
          if (isActive) {
            countdown = {
              hour: $countdownContainer.querySelector(".countdown__input.hour")
                .value,
              min: $countdownContainer.querySelector(".countdown__input.min")
                .value,
            };
          }

          const text = $todoInputContainer.querySelector(".todo__input").value;

          const newCard = new Card({
            tag: tags,
            countdown,
            text,
            cardComponent: this,
            modal: this.modal,
          });

          this.cards.todo.unshift(newCard);

          const allTags = TagStorage.getAllTags();
          tags.forEach((tag) => {
            const idx = TagStorage.contains(tag);
            allTags[idx].cardId.unshift(newCard.id);
          });
          window.localStorage.setItem("tag-key", JSON.stringify(allTags));

          CardStorage.addCardToTodo(newCard);

          const $allCardContainer = document.querySelector(
            ".all-card-container"
          );

          this.profileComponent.setProgress(
            this.cards.complete.length,
            this.cards.todo.length + this.cards.complete.length
          );

          if (!$allCardContainer.classList.contains("complete")) {
            $allCardContainer.prepend(newCard.element);
          }

          const $emptySignSpan = $allCardContainer.querySelector(".empty-sign");
          if ($emptySignSpan) {
            $emptySignSpan.remove();
          }

          const isChanged = $allCardContainer.matches(".complete");

          $todoSectionButton.click();
          this.searchCard.bind(this)(null, isChanged);
        },
      });
    });

    const $todoSectionButton = document.createElement("button");
    $todoSectionButton.className = "section-button__todo active";
    $todoSectionButton.textContent = "Todos";
    $todoSectionButton.addEventListener("click", () => {
      if (this.activeSection === "todos") return;

      this.activeSection = "todos";
      $todoSectionButton.classList.add("active");
      $completeSectionButton.classList.remove("active");
      $allCardContainer.classList.remove("complete");

      this.cards.todo.forEach((card) => {
        card.element.classList.remove("searched");
      });
      this.cards.complete.forEach((card) => {
        card.element.classList.remove("searched");
      });

      this.updateCardContainer();
      this.searchCard.bind(this)(null, true);

      if ($searchBar.value.length > 0) {
        $searchBar.focus();
      }
    });

    const $completeSectionButton = document.createElement("button");
    $completeSectionButton.className = "section-button__complete";
    $completeSectionButton.textContent = "Complete";
    $completeSectionButton.addEventListener("click", () => {
      if (this.activeSection === "complete") return;

      this.activeSection = "complete";
      $todoSectionButton.classList.remove("active");
      $completeSectionButton.classList.add("active");
      $allCardContainer.classList.add("complete");

      this.cards.todo.forEach((card) => {
        card.element.classList.remove("searched");
      });
      this.cards.complete.forEach((card) => {
        card.element.classList.remove("searched");
      });

      this.updateCardContainer();
      this.searchCard.bind(this)(null, true);

      if ($searchBar.value.length > 0) {
        $searchBar.focus();
      }
    });

    const $filterContainer = document.createElement("div");
    $filterContainer.className = "filter-container";

    const $searchContainer = document.createElement("div");
    $searchContainer.className = "filter__search-container";

    const $searchBar = document.createElement("input");
    $searchBar.className = "filter__search-bar";
    $searchBar.type = "text";
    $searchBar.placeholder = "Search card";
    $searchBar.spellcheck = false;
    $searchBar.addEventListener("focusin", () => {
      $clearButton.classList.add("active");

      if (!$allCardContainer.matches(".complete")) {
        $searchBar.style.borderColor = "#4b61cf";
      } else {
        $searchBar.style.borderColor = "#e26751";
      }
    });
    $searchBar.addEventListener("focusout", () => {
      $clearButton.classList.remove("active");
      $searchBar.style.borderColor = "";
    });
    $searchBar.addEventListener("input", this.searchCard.bind(this));

    const $clearButton = document.createElement("button");
    $clearButton.className = "filter__clear-button";
    $clearButton.innerHTML = '<i class="fas fa-times"></i>';
    $clearButton.addEventListener("click", () => {
      $searchBar.value = "";
      this.searchCard.bind(this)(null);
      $searchBar.focus();
    });

    const $allCardContainer = document.createElement("div");
    $allCardContainer.className = "all-card-container";
    this.$allCardContainer = $allCardContainer;

    $searchContainer.appendChild($searchBar);
    $searchContainer.appendChild($clearButton);
    $filterContainer.appendChild($searchContainer);
    $cardContainer.appendChild($addCardButton);
    $cardContainer.appendChild($todoSectionButton);
    $cardContainer.appendChild($completeSectionButton);
    $cardContainer.appendChild($filterContainer);
    $cardContainer.appendChild($allCardContainer);
    this.$target.appendChild($cardContainer);

    this.setHeightSize.bind(this)($cardContainer);
    window.addEventListener("resize", () => {
      this.setHeightSize.bind(this)($cardContainer);
    });
    this.updateCardContainer();
  }

  updateCardContainer() {
    const $allCardContainer = this.$allCardContainer;
    $allCardContainer.innerHTML = "";

    if ($allCardContainer.classList.contains("complete")) {
      this.cards.complete.forEach((card) => {
        $allCardContainer.appendChild(card.element);
      });

      if (this.cards.complete.length === 0) {
        const $emptySignSpan = document.createElement("span");
        $emptySignSpan.className = "empty-sign";
        $emptySignSpan.textContent = "No Cards";
        $allCardContainer.appendChild($emptySignSpan);
      }
    } else {
      this.cards.todo.forEach((card) => {
        $allCardContainer.appendChild(card.element);
      });
      if (this.cards.todo.length === 0) {
        const $emptySignSpan = document.createElement("span");
        $emptySignSpan.className = "empty-sign";
        $emptySignSpan.textContent = "No Cards";
        $allCardContainer.appendChild($emptySignSpan);
      }
    }
  }

  createTagContainer() {
    function createTag(tag, r, g, b, inSearch = false) {
      const $tag = document.createElement("div");
      $tag.className = "tag";
      $tag.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;

      const $tagSpan = document.createElement("span");
      $tagSpan.className = "tag__span";
      $tagSpan.textContent = "#" + tag;

      $tag.appendChild($tagSpan);

      if (!inSearch) {
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

    function checkRemainTagOnCard(tag) {
      let allTags = $tagInnerContainer.querySelectorAll(".tag");
      allTags = [].slice.call(allTags);

      const result = allTags.filter((item) => item.textContent === tag).length;

      if (result === 0) return false;
      return true;
    }

    function isValidTag(tag) {
      if (tag.length <= 0) return false;

      const checkKOR = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

      if (checkKOR.test(tag)) {
        if (tag.length < 1) return false;
        if (tag.length > 6) return false;
      } else {
        if (tag.length < 1) return false;
        if (tag.length > 16) return false;
      }

      return true;
    }

    function addTagOnInnerContainer(tag) {
      if (checkRemainTagOnCard("#" + tag)) return;

      const tagObj = TagStorage.getTagObj(tag);

      let r, g, b;

      if (!tagObj) {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
      } else {
        r = tagObj.r;
        g = tagObj.g;
        b = tagObj.b;
      }

      const $tag = createTag(tag, r, g, b);
      $tagInnerContainer.insertBefore($tag, $tagInputContainer);
    }

    function updateAllTagContainer() {
      function onItemClick(e) {
        let $item = e.target;

        if (!$item.classList.contains("tag__span")) {
          $item = $item.querySelector(".tag__span");
        }

        if (!$item) return;

        addTagOnInnerContainer($item.textContent.slice(1));
      }

      $allTagContainer.innerHTML = "";

      const allTags = TagStorage.getAllTags();

      $allTagContainer.classList.remove("empty");
      if (allTags.length === 0) {
        $allTagContainer.classList.add("empty");
        $allTagContainer.textContent = "No Tags";
      } else {
        allTags.forEach((tagObj) => {
          const { text, r, g, b } = tagObj;

          const $tagItem = document.createElement("div");
          $tagItem.className = "all-tag__item";

          const $tag = createTag(text, r, g, b, true);
          $tagItem.appendChild($tag);

          $allTagContainer.appendChild($tagItem);
        });

        // Remove EventListener
        const old_element = $allTagContainer;
        const new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
        $allTagContainer = new_element;

        $allTagContainer.addEventListener("mousedown", onItemClick);
      }
    }

    const $tagContainer = document.createElement("div");
    $tagContainer.className = "tag-container";

    const $tagInnerContainer = document.createElement("div");
    $tagInnerContainer.className = "tag-inner-container";
    $tagInnerContainer.style.cursor = "pointer";
    $tagInnerContainer.addEventListener("mouseenter", () => {
      if ($allTagContainer.classList.contains("hidden")) {
        $tagInnerContainer.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.3)";
      }
    });
    $tagInnerContainer.addEventListener("mouseleave", () => {
      $tagInnerContainer.style.boxShadow = "none";
    });

    let $allTagContainer = document.createElement("div");
    $allTagContainer.className = "all-tag-container hidden";

    const $tagInputContainer = document.createElement("div");
    $tagInputContainer.className = "tag__input-container";

    const $tagInput = document.createElement("input");
    $tagInput.className = "tag__input";
    $tagInput.type = "text";
    $tagInput.placeholder = "Add Tag...";
    $tagInput.spellcheck = false;
    $tagInput.style.cursor = "pointer";
    $tagInput.addEventListener("keyup", (e) => {
      let tag = $tagInput.value;

      if (e.keyCode === 13) {
        tag = tag.trim();

        if (checkRemainTagOnCard(tag) || !isValidTag(tag)) {
          $tagInput.value = "";
          return;
        }

        if (TagStorage.contains(tag) === -1) {
          let newObj = {
            text: tag,
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256),
            cardId: [],
          };
          TagStorage.appendTag(newObj);
        }
        addTagOnInnerContainer(tag);
        $tagInput.value = "";

        updateAllTagContainer();
      }
    });

    $tagInput.addEventListener("keydown", (e) => {
      let tag = $tagInput.value;

      if (e.keyCode === 8 && tag.length === 0) {
        let allTags = $tagInnerContainer.querySelectorAll(".tag");
        allTags = [].slice.call(allTags);

        if (allTags.length > 0) {
          const $recentTag = allTags.pop();
          $tagInnerContainer.removeChild($recentTag);
        }

        updateAllTagContainer();
      }
    });

    $tagInput.addEventListener("focusin", () => {
      $tagContainer.style.boxShadow = "0 0 30px rgba(0, 0, 0, 0.3)";
      $tagInnerContainer.style.borderRadius = "0";
      $tagInnerContainer.style.borderTopLeftRadius = "10px";
      $tagInnerContainer.style.borderTopRightRadius = "10px";
      $allTagContainer.style.borderTop = "1px solid rgba(0, 0, 0, 0.3)";
      $allTagContainer.classList.remove("hidden");
      $tagInnerContainer.style.cursor = "text";
      $tagInput.style.cursor = "text";

      updateAllTagContainer();
    });

    $tagInput.addEventListener("focusout", (e) => {
      $tagContainer.style.boxShadow = "none";
      $tagInnerContainer.style.borderRadius = "10px";
      $allTagContainer.classList.add("hidden");
      $tagInput.style.cursor = "pointer";
      $tagInnerContainer.style.cursor = "pointer";
    });

    $tagInputContainer.appendChild($tagInput);
    $tagInnerContainer.appendChild($tagInputContainer);
    $tagContainer.appendChild($tagInnerContainer);
    $tagContainer.appendChild($allTagContainer);

    return $tagContainer;
  }

  createCountdownContainer() {
    const $countdownContainer = document.createElement("div");
    $countdownContainer.className = "countdown-container";

    const $activeButton = document.createElement("button");
    $activeButton.className = "countdown__active-button";
    $activeButton.innerHTML = "<div class='countdown__active-circle'></div>";
    $activeButton.addEventListener("click", () => {
      $inputContainerCover.classList.toggle("active");
      $activeButton
        .querySelector(".countdown__active-circle")
        .classList.toggle("active");
    });

    const $activeSpan = document.createElement("span");
    $activeSpan.className = "countdown__active-span";
    $activeSpan.textContent = "Countdown";

    const $inputContainer = document.createElement("div");
    $inputContainer.className = "countdown__input-container";

    const $inputContainerCover = document.createElement("div");
    $inputContainerCover.className = "countdown__input-cover active";

    const $hourInput = document.createElement("input");
    $hourInput.classList = "countdown__input hour";
    $hourInput.type = "number";
    $hourInput.defaultValue = "0";
    $hourInput.min = "0";
    $hourInput.max = "23";
    $hourInput.addEventListener("change", () => {
      if ($hourInput.value === "") {
        $hourInput.value = "0";
      }

      const value = parseInt($hourInput.value);

      if (value < 0) $hourInput.value = "0";
      if (value > 23) $hourInput.value = "23";
    });

    const $minInput = document.createElement("input");
    $minInput.classList = "countdown__input min";
    $minInput.type = "number";
    $minInput.defaultValue = "0";
    $minInput.min = "0";
    $minInput.max = "59";
    $minInput.addEventListener("change", () => {
      if ($minInput.value === "") {
        $minInput.value = "0";
      }

      const value = parseInt($minInput.value);

      if (value < 0) $minInput.value = "0";
      if (value > 59) $minInput.value = "59";
    });

    const $hourSpan = document.createElement("span");
    $hourSpan.className = "countdown__span hour";
    $hourSpan.textContent = "H";

    const $minSpan = document.createElement("span");
    $minSpan.className = "countdown__span min";
    $minSpan.textContent = "M";

    $inputContainer.appendChild($inputContainerCover);
    $inputContainer.appendChild($hourInput);
    $inputContainer.appendChild($hourSpan);
    $inputContainer.appendChild($minInput);
    $inputContainer.appendChild($minSpan);
    $countdownContainer.appendChild($activeButton);
    $countdownContainer.appendChild($activeSpan);
    $countdownContainer.appendChild($inputContainer);

    return $countdownContainer;
  }

  createToDoContainer() {
    const textLimit = 80;

    const $toDoContainer = document.createElement("div");
    $toDoContainer.className = "todo-container";

    const $inputContainer = document.createElement("div");
    $inputContainer.className = "todo__input-container";

    const $toDoInput = document.createElement("input");
    $toDoInput.className = "todo__input";
    $toDoInput.type = "text";
    $toDoInput.spellcheck = false;
    $toDoInput.placeholder = "what to do?";
    $toDoInput.addEventListener("focusin", () => {
      $removeButton.classList.add("active");
    });
    $toDoInput.addEventListener("focusout", () => {
      $removeButton.classList.remove("active");
    });
    $toDoInput.addEventListener("input", () => {
      const textSize = $toDoInput.value.length;

      if (textSize > textLimit) {
        $lengthContainer.style.color = "rgb(255, 129, 107)";
        $toDoInput.style.borderColor = "rgb(255, 129, 107)";
      } else {
        $lengthContainer.style.color = "";
        $toDoInput.style.borderColor = "";
      }

      $lengthContainer.textContent = `${$toDoInput.value.length} / ${textLimit}`;
    });
    $toDoInput.addEventListener("keyup", (e) => {
      if (e.keyCode === 13) {
        const $submitButton = document.querySelector(".modal-content__ok");
        $submitButton.click();
      }
    });

    const $removeButton = document.createElement("button");
    $removeButton.className = "todo__remove";
    $removeButton.innerHTML = '<i class="fas fa-times"></i>';
    $removeButton.addEventListener("click", () => {
      $toDoInput.value = "";
      $lengthContainer.textContent = `0 / ${textLimit}`;
      $lengthContainer.style.color = "";
      $toDoInput.style.borderColor = "";
      $toDoInput.focus();
    });

    const $lengthContainer = document.createElement("div");
    $lengthContainer.className = "todo__length-container";
    $lengthContainer.textContent = `0 / ${textLimit}`;

    $inputContainer.appendChild($toDoInput);
    $inputContainer.appendChild($removeButton);
    $toDoContainer.appendChild($inputContainer);
    $toDoContainer.appendChild($lengthContainer);

    return $toDoContainer;
  }
}
