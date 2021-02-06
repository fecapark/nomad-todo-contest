import { TagStorage } from "../utils/CustomStorage.js";

export default class CardComponent {
  constructor({ $target, modal }) {
    this.$target = $target;
    this.modal = modal;
  }

  renderCardContainer() {
    const $cardContainer = document.createElement("main");
    $cardContainer.className = "card-container hidden";

    const $addCardButton = document.createElement("button");
    $addCardButton.className = "add-card-button";
    $addCardButton.innerHTML =
      '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>';

    $addCardButton.addEventListener("click", () => {
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
          console.log("wow");
        },
      });
    });

    $cardContainer.appendChild($addCardButton);
    this.$target.appendChild($cardContainer);
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
        r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
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
            r: Math.floor(Math.random() * 255),
            g: Math.floor(Math.random() * 255),
            b: Math.floor(Math.random() * 255),
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
    $minInput.classList = "countdown__input hour";
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
      } else {
        $lengthContainer.style.color = "";
      }

      $lengthContainer.textContent = `${$toDoInput.value.length} / ${textLimit}`;
    });

    const $removeButton = document.createElement("button");
    $removeButton.className = "todo__remove";
    $removeButton.innerHTML = '<i class="fas fa-times"></i>';
    $removeButton.addEventListener("click", () => {
      $toDoInput.value = "";
      $lengthContainer.textContent = `0 / ${textLimit}`;
      $lengthContainer.style.color = "";
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

  setState(nextData) {
    this.renderCardContainer();
  }
}

// export default class Card {}
