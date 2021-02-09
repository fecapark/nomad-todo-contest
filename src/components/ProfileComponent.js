import {
  FilterStorage,
  UserStorage,
  TagStorage,
  LangStorage,
  CardStorage,
} from "../utils/CustomStorage.js";
import { getTimeStatus } from "../utils/UserStatus.js";

export default class ProfileComponent {
  constructor({ $target, modal, cardComponent }) {
    this.$target = $target;
    this.modal = modal;
    this.user = UserStorage.isUserSigned ? UserStorage.getUserData() : null;
    this.cardComponent = cardComponent;
    this.filterTag = null;
  }

  renderProfile() {
    const profileContainer = document.createElement("header");
    profileContainer.className = "profile-container";

    const profileText = document.createElement("section");
    profileText.className = "profile-text";

    const profileName = document.createElement("span");
    profileName.className = "profile-text__name";
    profileName.textContent = this.user;

    const profileStatus = document.createElement("span");
    profileStatus.className = "profile-text__status";
    profileStatus.textContent = getTimeStatus();

    profileText.appendChild(profileName);
    profileText.appendChild(profileStatus);

    this.$progressContainer = this.createProgressContainer();
    this.$buttonContainer = this.createButtonContainer();
    this.$hashButtonContainer = this.createHashButtonContainer();

    profileContainer.appendChild(this.$progressContainer);
    profileContainer.appendChild(this.$buttonContainer);
    profileContainer.appendChild(this.$hashButtonContainer);
    profileContainer.appendChild(profileText);
    this.$target.appendChild(profileContainer);

    const { todo, complete } = this.cardComponent.cards;

    this.setProgress(complete.length, todo.length + complete.length);
    this.setSlider();
  }

  createProgressContainer() {
    const $progressContainer = document.createElement("section");
    $progressContainer.className = "progress-container";
    $progressContainer.innerHTML =
      '<div class="progress__inner"> \
         <div class="progress__inner-container"> \
           <span class="progress__inner-percentage"></span> \
           <span class="progress__inner-nums"></span> \
         </div> \
       </div> \
       <div class="progress__circle"> \
         <div class="progress__dot"> \
           <span></span> \
         </div> \
         <div class="progress__bar left"> \
           <div class="progress__bar-inner"></div> \
         </div> \
         <div class="progress__bar right"> \
           <div class="progress__bar-inner"></div> \
         </div> \
      </div>';

    return $progressContainer;
  }

  createButtonContainer() {
    const $buttonContainer = document.createElement("section");
    $buttonContainer.className = "profile-button-container";

    const $toggleBtn = document.createElement("button");
    $toggleBtn.className = "profile-button toggle";
    $toggleBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
    $toggleBtn.title = "Toggle Menu";
    $toggleBtn.addEventListener("click", () => {
      const $i = $toggleBtn.querySelector("i");

      if ($i.classList.contains("fa-times")) {
        $toggleBtn.style.color = "";
        $toggleBtn.style.borderColor = "";
        $i.classList.remove("fa-times");
        $i.classList.add("fa-ellipsis-v");
      } else {
        $toggleBtn.style.color = "white";
        $toggleBtn.style.borderColor = "white";
        $i.classList.remove("fa-ellipsis-v");
        $i.classList.add("fa-times");
      }

      $darkModeBtn.classList.toggle("hidden");
      $langBtn.classList.toggle("hidden");
      $logoutBtn.classList.toggle("hidden");
    });

    const $darkModeBtn = document.createElement("button");
    $darkModeBtn.className = "profile-button darkmode hidden";
    $darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    $darkModeBtn.title = "Toggle Darkmode";
    $darkModeBtn.addEventListener("click", () => {
      this.modal.setState({
        title: LangStorage.isEnglish() ? "Well.." : "음..",
        text: LangStorage.isEnglish()
          ? ["This has not been developed yet.", "Sorry!"]
          : ["이 기능은 아직 구현되지 않았습니다.", "기다려주세요!"],
        onContinue: () => {},
        modalMinHeight: 400,
        hideContinue: false,
      });
    });

    const $langBtn = document.createElement("button");
    $langBtn.className = "profile-button language hidden";
    $langBtn.innerHTML = '<i class="fas fa-globe-americas"></i>';
    $langBtn.title = "Toggle Language";
    $langBtn.addEventListener("click", () => {
      LangStorage.toggleLanguage();
      location.reload();
    });

    const $logoutBtn = document.createElement("button");
    $logoutBtn.className = "profile-button logout hidden";
    $logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    $logoutBtn.title = "Sign out";
    $logoutBtn.addEventListener("click", () => {
      this.modal.setState({
        title: LangStorage.isEnglish() ? "Sign out" : "로그아웃",
        text: LangStorage.isEnglish()
          ? ["Your all data will remove.", "Continue sign out?"]
          : ["모든 데이터가 삭제됩니다.", "로그아웃 하시겠습니까?"],
        onContinue: () => {
          UserStorage.removeUserData();
        },
        modalMinHeight: 400,
        hideContinue: false,
      });
    });

    $buttonContainer.appendChild($toggleBtn);
    $buttonContainer.appendChild($darkModeBtn);
    $buttonContainer.appendChild($langBtn);
    $buttonContainer.appendChild($logoutBtn);

    return $buttonContainer;
  }

  createHashButtonContainer() {
    function createTag(
      tag,
      r,
      g,
      b,
      inThumb = false,
      $tagInnerContainer = null
    ) {
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

    const $hashButtonContainer = document.createElement("section");
    $hashButtonContainer.className = "hash-button-container";

    const $toggleButton = document.createElement("button");
    $toggleButton.className = "hash-button toggle";
    $toggleButton.innerHTML = '<i class="fas fa-hashtag"></i>';
    $toggleButton.title = "Toggle Hashtag Menu";
    $toggleButton.addEventListener("click", () => {
      const $i = $toggleButton.querySelector("i");

      if ($i.classList.contains("fa-times")) {
        $toggleButton.style.color = "";
        $toggleButton.style.borderColor = "";
        $i.classList.remove("fa-times");
        $i.classList.add("fa-hashtag");
      } else {
        $toggleButton.style.color = "white";
        $toggleButton.style.borderColor = "white";
        $i.classList.remove("fa-hashtag");
        $i.classList.add("fa-times");
      }

      $filterButton.classList.toggle("hidden");
      $manageButton.classList.toggle("hidden");
    });

    const $filterButton = document.createElement("button");
    $filterButton.className = "hash-button filter hidden";
    $filterButton.innerHTML = '<i class="fas fa-filter"></i>';
    $filterButton.title = "Filter by Hashtag";
    $filterButton.addEventListener("click", () => {
      const $sender = document.createElement("div");
      $sender.className = "sender filter";

      const $tagContainer = this.cardComponent.createTagContainer(true);
      const $tagInnerContainer = $tagContainer.querySelector(
        ".tag-inner-container"
      );

      this.filterTag.forEach((tag) => {
        const { r, g, b, a } = TagStorage.getTagObj(tag);
        const $tag = createTag(tag, r, g, b, a, false, $tagInnerContainer);

        $tagInnerContainer.insertBefore(
          $tag,
          $tagContainer.querySelector(".tag__input-container")
        );
      });

      $sender.appendChild($tagContainer);

      this.modal.setState({
        title: LangStorage.isEnglish() ? "Hashtag Filter" : "해시태그 필터링",
        html: {
          data: $sender,
          type: "element",
        },

        onContinue: () => {
          const $tags = $tagInnerContainer.querySelectorAll(".tag");
          const tags = [].slice
            .call($tags)
            .map(($tag) =>
              $tag.querySelector(".tag__span").textContent.slice(1)
            );

          this.filterTag = tags;
          FilterStorage.setAllFilter(tags);
          this.cardComponent.searchCard.bind(this.cardComponent)(null);

          const $filterContainer = document.querySelector(".filter-container");
          const $filterClearButton = document.querySelector(
            ".filter__filter-clear-button"
          );
          if (tags.length > 0) {
            $filterContainer.classList.add("filter-active");
            $filterClearButton.classList.add("active");
          } else {
            $filterContainer.classList.remove("filter-active");
            $filterClearButton.classList.remove("active");
          }
        },

        htmlMinHeight: 50,
        modalMinHeight: 200,
        hideContinue: false,
      });
    });

    const $manageButton = document.createElement("button");
    $manageButton.className = "hash-button manage hidden";
    $manageButton.innerHTML = '<i class="fas fa-tools"></i>';
    $manageButton.title = "Edit Hashtag";
    $manageButton.addEventListener("click", () => {
      const $sender = document.createElement("div");
      $sender.className = "sender";

      const $tagContainer = this.cardComponent.createTagContainer(false, true);

      const $editContainer = document.createElement("div");
      $editContainer.className = "edit-container";
      $editContainer.innerHTML =
        ' \
        <div class="edit__cover"></div> \
        <div class="edit__thumb-container"> \
          <div class="tag" style="background-color: rgba(0, 0, 0, 1); color: white"> \
            <span class="tag__span"></span> \
          </div> \
        </div> \
        <div class="edit__input-container"> \
          <div class="edit__input-mini"> \
            <span class="edit-span">R</span> \
            <input class="edit-input r" type="range" min="0" max="255" value="0"> \
          </div> \
          <div class="edit__input-mini"> \
            <span class="edit-span">G</span> \
            <input class="edit-input g" type="range" min="0" max="255" value="0"> \
          </div> \
          <div class="edit__input-mini"> \
            <span class="edit-span">B</span> \
            <input class="edit-input b" type="range" min="0" max="255" value="0"> \
          </div> \
          <div class="edit__input-mini"> \
            <span class="edit-span">A</span> \
            <input class="edit-input a" type="range" min="0" max="100" value="0"> \
          </div> \
        </div> \
        <div class="edit__button-container"> \
          <button class="edit__apply-button"></button> \
          <button class="edit__delete-button"></button> \
        </div> \
      ';

      $editContainer.querySelector(
        ".edit__delete-button"
      ).textContent = LangStorage.isEnglish() ? "Delete Tag" : "태그 삭제";
      $editContainer.querySelector(
        ".edit__apply-button"
      ).textContent = LangStorage.isEnglish() ? "Apply" : "적용";
      $editContainer.querySelector(
        ".tag__span"
      ).textContent = LangStorage.isEnglish()
        ? "#Select_Tag_First"
        : "#태그를_선택해주세요";

      const $inputR = $editContainer.querySelector(".edit-input.r");
      $inputR.addEventListener("input", () => {
        const $tag = $editContainer.querySelector(".tag");
        $tag.style.backgroundColor = `rgba(${$inputR.value}, ${
          $inputG.value
        }, ${$inputB.value}, ${$inputA.value / 100})`;
      });

      const $inputG = $editContainer.querySelector(".edit-input.g");
      $inputG.addEventListener("input", () => {
        const $tag = $editContainer.querySelector(".tag");
        $tag.style.backgroundColor = `rgba(${$inputR.value}, ${
          $inputG.value
        }, ${$inputB.value}, ${$inputA.value / 100})`;
      });

      const $inputB = $editContainer.querySelector(".edit-input.b");
      $inputB.addEventListener("input", () => {
        const $tag = $editContainer.querySelector(".tag");
        $tag.style.backgroundColor = `rgba(${$inputR.value}, ${
          $inputG.value
        }, ${$inputB.value}, ${$inputA.value / 100})`;
      });

      const $inputA = $editContainer.querySelector(".edit-input.a");
      $inputA.addEventListener("input", () => {
        const $tag = $editContainer.querySelector(".tag");
        $tag.style.backgroundColor = `rgba(${$inputR.value}, ${
          $inputG.value
        }, ${$inputB.value}, ${$inputA.value / 100})`;
      });

      const $editApplyButton = $editContainer.querySelector(
        ".edit__apply-button"
      );
      $editApplyButton.addEventListener("click", () => {
        const newR = $inputR.value;
        const newG = $inputG.value;
        const newB = $inputB.value;
        const newA = $inputA.value / 100;

        const tag = $editContainer
          .querySelector(".tag__span")
          .textContent.slice(1);

        const allTagsFromStorage = TagStorage.getAllTags();
        for (let i = 0; i < allTagsFromStorage.length; i++) {
          if (allTagsFromStorage[i].text === tag) {
            allTagsFromStorage[i].r = newR;
            allTagsFromStorage[i].g = newG;
            allTagsFromStorage[i].b = newB;
            allTagsFromStorage[i].a = newA;
            break;
          }
        }
        window.localStorage.setItem(
          "tag-key",
          JSON.stringify(allTagsFromStorage)
        );

        let allTags = [].slice.call(document.querySelectorAll(".tag"));
        allTags = allTags.filter(($tag) => {
          return $tag.querySelector(".tag__span").textContent.slice(1) === tag;
        });

        allTags.forEach(($tag) => {
          $tag.style.backgroundColor = `rgba(${$inputR.value}, ${
            $inputG.value
          }, ${$inputB.value}, ${$inputA.value / 100})`;
        });
      });

      const $editDeleteButton = $editContainer.querySelector(
        ".edit__delete-button"
      );
      $editDeleteButton.addEventListener("click", () => {
        const tag = $editContainer
          .querySelector(".tag__span")
          .textContent.slice(1);

        let allTags = [].slice.call(document.querySelectorAll(".tag"));
        allTags = allTags.filter(($tag) => {
          return $tag.querySelector(".tag__span").textContent.slice(1) === tag;
        });

        allTags.forEach(($tag) => {
          $tag.remove();
        });

        TagStorage.removeTag(tag);
        FilterStorage.removeFilter(tag);
        this.filterTag = FilterStorage.getAllFilters();
        if (this.filterTag.length === 0) {
          document
            .querySelector(".filter-container")
            .classList.remove("filter-active");
          document
            .querySelector(".filter__filter-clear-button")
            .classList.remove("active");
        }

        for (let i = 0; i < this.cardComponent.cards.todo.length; i++) {
          this.cardComponent.cards.todo[i].tag = this.cardComponent.cards.todo[
            i
          ].tag.filter((t) => {
            return t !== tag;
          });

          if (this.cardComponent.cards.todo[i].tag.length === 0) {
            this.cardComponent.cards.todo[i].element.querySelector(
              ".card__tag-container"
            ).textContent = LangStorage.isEnglish() ? "No Tags" : "태그 없음";
          }
        }

        for (let i = 0; i < this.cardComponent.cards.complete.length; i++) {
          this.cardComponent.cards.complete[
            i
          ].tag = this.cardComponent.cards.complete[i].tag.filter((t) => {
            return t !== tag;
          });

          if (this.cardComponent.cards.complete[i].tag.length === 0) {
            this.cardComponent.cards.complete[i].element.querySelector(
              ".card__tag-container"
            ).textContent = LangStorage.isEnglish() ? "No Tags" : "태그 없음";
          }
        }

        const todoCards = CardStorage.getAllCardFromTodo();
        for (let i = 0; i < todoCards.length; i++) {
          todoCards[i].tag = todoCards[i].tag.filter((t) => {
            return t !== tag;
          });
        }
        window.localStorage.setItem("card-key-todo", JSON.stringify(todoCards));

        const completeCards = CardStorage.getAllCardFromComplete();
        for (let i = 0; i < completeCards.length; i++) {
          completeCards[i].tag = completeCards[i].tag.filter((t) => {
            return t !== tag;
          });
        }
        window.localStorage.setItem(
          "card-key-complete",
          JSON.stringify(completeCards)
        );

        this.cardComponent.searchCard(null);
      });

      $sender.appendChild($tagContainer);
      $sender.appendChild($editContainer);

      this.modal.setState({
        title: LangStorage.isEnglish() ? "Edit Tag" : "태그 수정",
        html: {
          data: $sender,
          type: "element",
        },
        onContinue: () => {
          console.log("ww");
        },
        hideContinue: true,
      });
    });

    const $fake = document.createElement("button");
    $fake.className = "hash-button hidden";

    $hashButtonContainer.appendChild($toggleButton);
    $hashButtonContainer.appendChild($filterButton);
    $hashButtonContainer.appendChild($manageButton);
    $hashButtonContainer.appendChild($fake);

    return $hashButtonContainer;
  }

  setProgress(endCount, allCount) {
    function getPercentage(endCount, allCount) {
      return Math.round((endCount / allCount) * 100);
    }

    function getDegree(percentage) {
      if (percentage >= 50) percentage -= 50;

      return Math.round((percentage * 180) / 50);
    }

    let p = 0,
      d = 0;

    if (allCount > 0) {
      p = getPercentage(endCount, allCount);
      d = getDegree(p);
    }

    const $rightBar = this.$progressContainer.querySelector(
      ".progress__circle .right .progress__bar-inner"
    );
    const $leftBar = this.$progressContainer.querySelector(
      ".progress__circle .left .progress__bar-inner"
    );
    const $dot = this.$progressContainer.querySelector(
      ".progress__circle .progress__dot"
    );
    const $innerPs = this.$progressContainer.querySelectorAll(
      ".progress__inner-percentage"
    );
    const $innerN = this.$progressContainer.querySelector(
      ".progress__inner-nums"
    );

    $innerPs.forEach(($innerP) => ($innerP.textContent = `${p}%`));
    if (allCount === 0) {
      $innerN.textContent = `-`;
    } else {
      $innerN.textContent = `${endCount} / ${allCount}`;
    }

    if (p < 50) {
      $rightBar.style.transform = `rotate(${d}deg)`;
      $leftBar.style.transform = `rotate(0deg)`;
      $dot.style.transform = `rotate(${d - 90}deg)`;
    } else {
      $rightBar.style.transform = `rotate(180deg)`;
      $leftBar.style.transform = `rotate(${d}deg)`;
      $dot.style.transform = `rotate(${d + 90}deg)`;
      $dot.style.zIndex = 4;
    }
  }

  setSlider() {
    const $progresstar$target = document.querySelector(
      ".progress__inner-container"
    );

    const $firstChild = $progresstar$target.firstElementChild.cloneNode(true);
    $progresstar$target.appendChild($firstChild);

    function slide() {
      let idx = 0;

      setInterval(() => {
        const mediaQuery = window.matchMedia("(max-width: 30em)");
        let elementHeight = mediaQuery.matches ? 56 : 80;

        $progresstar$target.style.transition =
          "0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        $progresstar$target.style.transform = `translate3d(0px, -${
          (idx + 1) * elementHeight
        }px, 0px)`;

        idx++;

        if (idx === 2) {
          setTimeout(function () {
            $progresstar$target.style.transition = "0s";
            $progresstar$target.style.transform = "translate3d(0px, 0px, 0px)";
          }, 701);
          idx = 0;
        }
      }, 5000);
    }

    slide();
  }

  setState(nextData) {
    this.$target.classList.remove("hidden");
    this.user = nextData;
    this.filterTag = FilterStorage.getAllFilters();
    this.renderProfile();
  }
}
