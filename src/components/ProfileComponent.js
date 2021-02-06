import { UserStorage } from "../utils/CustomStorage.js";
import { getTimeStatus } from "../utils/UserStatus.js";

export default class ProfileComponent {
  constructor({ $target, modal }) {
    this.$target = $target;
    this.modal = modal;
    this.user = UserStorage.isUserSigned ? UserStorage.getUserData() : null;
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

    this.setProgress(10, 13);
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
        $i.classList.remove("fa-times");
        $i.classList.add("fa-ellipsis-v");
      } else {
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

    const $langBtn = document.createElement("button");
    $langBtn.className = "profile-button language hidden";
    $langBtn.innerHTML = '<i class="fas fa-globe-americas"></i>';
    $langBtn.title = "Toggle Language";

    const $logoutBtn = document.createElement("button");
    $logoutBtn.className = "profile-button logout hidden";
    $logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    $logoutBtn.title = "Sign out";
    $logoutBtn.addEventListener("click", () => {
      this.modal.setState({
        title: "Sign out",
        text: ["Your all data will remove.", "Continue sign out?"],
        onContinue: () => {
          UserStorage.removeUserData();
        },
      });
    });

    $buttonContainer.appendChild($toggleBtn);
    $buttonContainer.appendChild($darkModeBtn);
    $buttonContainer.appendChild($langBtn);
    $buttonContainer.appendChild($logoutBtn);

    return $buttonContainer;
  }

  createHashButtonContainer() {
    const $hashButtonContainer = document.createElement("section");
    $hashButtonContainer.className = "hash-button-container";

    const $hashFilterButton = document.createElement("button");
    $hashFilterButton.className = "hash-button filter";
    $hashFilterButton.innerHTML = '<i class="fas fa-hashtag"></i>';
    $hashFilterButton.title = "Filter by hashtag";

    $hashButtonContainer.appendChild($hashFilterButton);

    for (let i = 0; i < 3; i++) {
      const $hashFilterButton_Fake = document.createElement("button");
      $hashFilterButton_Fake.className = "hash-button filter hidden";
      $hashFilterButton_Fake.innerHTML = '<i class="fas fa-hashtag"></i>';
      $hashButtonContainer.appendChild($hashFilterButton_Fake);
    }

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

    const p = getPercentage(endCount, allCount);
    const d = getDegree(p);

    const $rightBar = this.$progressContainer.querySelector(
      ".progress__circle .right .progress__bar-inner"
    );
    const $leftBar = this.$progressContainer.querySelector(
      ".progress__circle .left .progress__bar-inner"
    );
    const $dot = this.$progressContainer.querySelector(
      ".progress__circle .progress__dot"
    );
    const $innerP = this.$progressContainer.querySelector(
      ".progress__inner-percentage"
    );
    const $innerN = this.$progressContainer.querySelector(
      ".progress__inner-nums"
    );

    $innerP.textContent = `${p}%`;
    $innerN.textContent = `${endCount} / ${allCount}`;

    if (p < 50) {
      $rightBar.style.transform = `rotate(${d}deg)`;
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
    this.renderProfile();
  }
}
