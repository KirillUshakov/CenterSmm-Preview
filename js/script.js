import Swiper from '../plugins/swiper/swiper-bundle.min.js';

const html = document.body.parentNode;
let fixedElementsQuery = ['body', '#header'];
let fixedElements = [];

const initFixedElements = () => {
  const arr = [];

  fixedElementsQuery.forEach(el => {
    const element = document.querySelector(el);
    const paddingRight = element ? Number(window.getComputedStyle(element, null).getPropertyValue('padding-right')?.replace(/\D/gm, '')) : '0px';

    if (element) {
      arr.push({
        el: element,
        paddingRight: paddingRight,
      });
    }
  })

  fixedElements = arr;
}
const lockScreen = () => {
  html.classList.add('lock');
  fixedElements.forEach(element => {
    element.el.style.paddingRight = Number(element.paddingRight + getScrollSize()) + 'px';
  })

}
const unLockScreen = () => {
  html.classList.remove('lock');
  fixedElements.forEach(element => {
    element.el.style.paddingRight = element.paddingRight + 'px';
  })
}
const getScrollSize = () => {
  let div = document.createElement('div');
  let scrollSize = 0;

  div.style = "position: fixed; overflow: scroll; pointer-events:none; opacity:0;";

  document.body.appendChild(div);
  scrollSize = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);

  return scrollSize;
};
const insertPlaceholder = (target, placeholderId, copyClasses = true) => {
  const parent = target.parentNode;
  const placeholder = document.createElement('div');
  const existPlaceholder = document.getElementById(placeholderId);

  // Setup placeholder
  if (copyClasses) {
    placeholder.classList = target.classList;
  }

  placeholder.style.maxWidth = '100%';
  placeholder.style.width = target.offsetWidth + 'px';
  placeholder.style.height = target.offsetHeight + 'px';

  if (placeholderId) placeholder.setAttribute('id', placeholderId);
  if (existPlaceholder) existPlaceholder.remove();

  parent.insertBefore(placeholder, target.nextSibling);
}


document.addEventListener("DOMContentLoaded", function () {
  // Modules
  document.body.classList.remove('no-js');

  function testWebP(callback) {
  var webP = new Image();
  webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
  };
  webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {
  document.querySelector('body').classList.add(support ? 'webp' : 'no-webp');
});


  // Parts
  const header = document.getElementById('header');

// Placeholder for header
function updateHeaderPlaceholder () {
  insertPlaceholder(header, 'header-placeholder', false);
}
updateHeaderPlaceholder();

window.addEventListener('resize', updateHeaderPlaceholder);

// Open / close menu
const burger = document.querySelector('#header-burger');
const headerMenu = document.querySelector('#header-menu');

burger.addEventListener('click', () => {
  headerMenu.classList.toggle('active');

  if (burger.classList.contains('active')) {
    burger.classList.remove('active');
    burger.classList.add('close');
    unLockScreen();
  } else {
    burger.classList.remove('close');
    burger.classList.add('active');
    lockScreen();
  }
})

  const reviewSliderWrapper = document.querySelectorAll('.reviews__slider');

reviewSliderWrapper.forEach(el => {
  const slider = new Swiper(el.querySelector('.swiper'), {
    // Optional parameters
    direction: 'horizontal',
    loop: false,

    slidesPerView: 1.4,
    centeredSlides: true,
    spaceBetween: 10,

    // If we need pagination
    pagination: {
      el: el.querySelector('.swiper-pagination'),
      clickable: true,
    },

    // Navigation arrows
    navigation: {
      nextEl: el.querySelector('.swiper-button-next'),
      prevEl: el.querySelector('.swiper-button-prev'),
    },

    breakpoints: {
      576: {
        slidesPerView: 2,
        spaceBetween: 15,
        centeredSlides: false,
        loop: true,
      },

      992: {
        slidesPerView: 3,
        centeredSlides: false,
        loop: true,
      }
    }
  });
});

  const allPopups = document.querySelectorAll('.popup[id]');
const popupTrigers = document.querySelectorAll('[data-popup]');
let currentPopup = null;

// Setup popups
allPopups.forEach(popup => {
  const popupId = popup.getAttribute('id');
  const content = popup.querySelector('.popup__content');
  const closeBtn = popup.querySelectorAll('[data-close]');

  popup.onclick = () => closePopup(popupId);
  popup.addEventListener('animationend', popupAnimEnd);

  closeBtn.forEach(btn => btn.onclick = () => closePopup(popupId ? popupId : closeBtn.closest('.popup').getAttribute('id')));
  content.onclick = (e) => e.stopPropagation();
})

// Setup triggers
popupTrigers.forEach(trigger => {
  const popupId = trigger.dataset.popup;
  if (!document.getElementById(popupId)) {
    trigger.classList.add('disabled');
    return;
  }

  trigger.onclick = () => {
    openPopup(popupId, trigger.closest('.popup') ? false : true, trigger.dataset.popupTitle ? trigger.dataset.popupTitle : null);
  };
});

function popupAnimEnd (e) {
  if (e.target !== this || !e.target.classList.contains('out')) return;
  this.classList.remove('out', 'active');

  if (currentPopup === this) unLockScreen();
};

function openPopup (popupId, doLockScreen = true, title = null) {
  const popup = document.getElementById(popupId);
  if (!popup || (popup.classList.contains('active') && !popup.classList.contains('out'))) return;

  // Preparations
  setTitle();
  closeActivePopups();
  if (doLockScreen) lockScreen();

  // Actions
  currentPopup = popup;
  popup.classList.remove('out', 'active')
  popup.classList.add('active');

  popup.querySelector('video[data-autoplay]')?.play();

  // Functions
  function setTitle () {
    const titleEl = popup.querySelector('.popup__title');
    if (!titleEl) return;

    // Save started title if title change
    if (!popup.dataset.title && title) {
      popup.dataset.title = titleEl ? titleEl.innerHTML : '';
    }

    // Set title
    if (!title && !popup.dataset.title) return;
    titleEl.innerHTML = title ? title : popup.dataset.title;
  }
}

function closePopup (popupId) {
  const popup = popupId ? document.getElementById(popupId) : this.closest('.popup');
  if (!popup) return;

  popup.classList.add('out');

  popup.querySelectorAll('video')?.forEach(video => video.pause());
}

function closeActivePopups () {
  const activePopups = document.querySelectorAll('.popup.active');
  activePopups.forEach(popup => closePopup(popup.getAttribute('id')));
}

  const accordions = document.querySelectorAll(".accordion,[data-accordion]");
accordions.forEach((accordion) => initAccordionHandler(accordion));

function initAccordion(accordion) {
  const animationOptions = { duration: 180, fill: "forwards" };
  const items = accordion.querySelectorAll(".accordion-item,[data-accordion-item]");
  const defaultItem = accordion.querySelector('.accordion-item.default,[data-accordion-item-default]');

  const closeAllItems = (...exepts) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const content = item.querySelector('.accordion-item__content,[data-accordion-item-content]');

      if (exepts.find(el => el === item)) continue;
      closeItem(item, content);
    }
  }
  const closeItem = (item, content) => {
    content.animate({ height: "0px" }, animationOptions);
    item.classList.remove("open");
  };
  const openItem = (item, content) => {
    content.animate({ height: `${ content.scrollHeight }px` }, animationOptions);
    item.classList.add("open");
  }

  // Data options
  const onlyMode = accordion.dataset.only ? true : false;

  items.forEach((item) => {
    const trigger = item.querySelector(".accordion-item__header,[data-accordion-item-header]");
    const content = item.querySelector(".accordion-item__content,[data-accordion-item-content]");

    trigger.onclick = () => {
      if (onlyMode) {
        closeAllItems(item);
      }

      if (item.classList.contains("open")) {
        closeItem(item, content);
        return;
      }

      openItem(item, content);
    };
  });

  if (defaultItem) {
    const trigger = defaultItem.querySelector('.accordion-item__header,[data-accordion-item-header]');
    trigger.click();
  }
}

function initAccordionHandler (accordion) {
  const availableTo = accordion.dataset.availableTo ? accordion.dataset.availableTo : undefined;
  let doLoad = true;

  if (availableTo && availableTo <= window.innerWidth) {
    doLoad = false;
  }

  if (!doLoad) {
    accordion.classList.add('no-init');
    return;
  }

  accordion.classList.remove('no-init');
  initAccordion(accordion);
}

window.addEventListener('resize', () => {
  accordions.forEach((accordion) => initAccordionHandler(accordion));
})

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {

  if (anchor.getAttribute('href') == '#') return;

  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const headerHeight = document.querySelector('header').offsetHeight;
    const offsetTop = document.querySelector(this.getAttribute('href')).offsetTop || 0;
    window.scrollTo({
      left: 0,
      top: offsetTop - headerHeight,
      behavior: 'smooth'
    });
  });
});

  class inputActionHandler {
  valueFilter = {
    min: 0,
    max: undefined,
  }

  constructor (actionEl, actionType) {
    this.inputLabel = actionEl.closest('.input-label');
    this.input = this.inputLabel?.querySelector('input.input-label__input');
    this.inputDisplayValue = this.inputLabel?.querySelector('.input-label__value');
    this.inputStep = this.input.dataset.inputStep ? this.input.dataset.inputStep : 1;

    this.actionEl = actionEl;
    this.actionType = actionType;
  }

  init () {
    this.actionEl.addEventListener('click', (e) => {
      e.preventDefault();
      this.actionHandler(this.actionType);
    });

    if (this.input.getAttribute('type') == 'number') {
      this.initNumberInput();
    }
  }

  actionHandler (actionType) {
    switch (actionType) {
      case 'reset':
        this.reset();
        break;
      case 'plus':
        this.plus();
        break;
      case 'minus':
        this.minus();
        break;
      default:
        break;
    }
  }

  initNumberInput () {
    this.initFilter();

    this.input.onfocus = () => {
      this.input.select();
    }

    this.input.onchange = () => {
      this.inputNumberFilter();
      this.updateValueDisplay();
    }

    window.onkeydown = (e) => {
      if (e.key == 'Enter' && document.activeElement == this.input) {
        this.input.blur();
      }
    }
  }

  reset () {
    this.input.value = '';
  }

  plus () {
    this.input.value = Number(this.input.value) + Number(this.inputStep);
    this.inputNumberFilter();
    this.updateValueDisplay();
  }

  minus () {
    this.input.value = Number(this.input.value) - Number(this.inputStep);
    this.inputNumberFilter();
    this.updateValueDisplay();
  }

  initFilter () {
    const dataset = this.input.dataset;

    for (const key in this.valueFilter) {
      const dataKey = 'input' + key[0].toUpperCase() + key.substring(1);

      if (dataset[dataKey]) {
        this.valueFilter[key] = dataset[dataKey];
      }
    }
  }

  inputNumberFilter () {
    const filter = this.valueFilter;
    let filteredVal = this.input.value;

    if (filter.min !== undefined) {
      filteredVal = Math.max(filteredVal, filter.min);
    }

    if (filter.max !== undefined) {
      filteredVal = Math.min(filteredVal, filter.max);
    }

    this.input.value = filteredVal;
  }

  updateValueDisplay () {
    if (!this.inputDisplayValue) return;

    this.inputDisplayValue.innerHTML = this.input.value;
  }
}

class inputValidateHandler {
  constructor (input, validateType) {
    this.input = input;
    this.validateType = validateType;
  }

  init () {
    this.input.addEventListener('change', (e) => this.change(e));
  }

  change () {}
}

class inputValidateTelegram extends inputValidateHandler {
  constructor (input, validateType) {
    super(input, validateType);
  }

  change (e) {
    const value = e.target.value;
    let result = value;

    if (value[0] != '@') {
      result = '@' + result;
    }

    this.input.value = result;
  }
}

// Init input actions
const inputActions = document.querySelectorAll('[data-input-action]');
inputActions.forEach(action => {
  const handler = new inputActionHandler(action, action.dataset.inputAction);
  handler.init();
})

// Init input validate
const inputValidates = document.querySelectorAll('[data-input-validate]');
inputValidates.forEach(el => {
  const validateType = el.dataset.inputValidate;
  let validateClass;

  switch (validateType) {
    case 'telegram':
      validateClass = new inputValidateTelegram(el, validateType);
      break;

    default:
      validateClass = new inputValidateHandler(el, validateType);
      break;
  }

  validateClass.init();
})

  const selectorWrappers = document.querySelectorAll('.selector-wrapper');
selectorWrappers.forEach(el => initCustomSelect(el));

function initCustomSelect (wrapper) {
  const targetSelect = wrapper.querySelector('select');
  const select = wrapper.querySelector('.selector');
  const input = select.querySelector('.selector__input');
  const optionList = select.querySelector('.selector__list-wrapper')
  const options = select.querySelectorAll('button.selector__option');
  const display = {
    value: select.querySelector('.selector__value'),
    tag: select.querySelector('.selector__tag-value'),
  };

  const listHeight = optionList.scrollHeight;
  const listAnimationKFrames = [
    {
      height: 0,
      opacity: 0,
    },
    {
      height: listHeight + 'px',
      opacity: 1,
    }
  ];
  const listAnimationOptions = {
    duration: 200,
    iterations: 1,
    fill: 'forwards',
  }

  let isAnimation = false;

  input.onclick = toggleOptionList;
  options.forEach(option => option.onclick = () => optionHandler(option));

  function toggleOptionList () {
    if (isAnimation) return;

    let KFrames = [...listAnimationKFrames];
    isAnimation = true;

    if (input.classList.contains('active')) {
      KFrames.reverse()
    }

    const animation = optionList.animate(KFrames, listAnimationOptions);
    animation.finished.finally(() => {
      isAnimation = false;
    });
    input.classList.toggle('active');
  }

  function optionHandler (option) {
    setActiveOption(option);
    updateValue(option);
  }

  function setActiveOption (option) {
    options.forEach(el => el.classList.remove('active'));
    option.classList.add('active');

    input.focus();
    toggleOptionList();
  }
  function updateValue (option) {
    const value = option.dataset.value;
    const optionValues = {
      value: option.querySelector('.selector__option-value') ? option.querySelector('.selector__option-value').cloneNode(true) : document.createElement('span'),
      tag: option.querySelector('.tag') ? option.querySelector('.tag').cloneNode(true) : document.createElement('span'),
    }

    targetSelect.value = value;

    display.value.innerHTML = display.tag.innerHTML = '';
    display.value.appendChild(optionValues.value);
    display.tag.appendChild(optionValues.tag);
  }
}

  const rollElems = document.querySelectorAll('[data-roll]');
rollElems.forEach(el => initRollHandler(el));
window.addEventListener('resize', () => {
  rollElems.forEach(el => initRollHandler(el));
});

function initRoll (elem) {
  const rollHeight = elem.dataset.roll;
  const maxHeight = elem.scrollHeight;
  const rollTexts = {
    show: 'Развернуть',
    hide: 'Свернуть',
  };
  const animKF = [
    { height: rollHeight + 'px' },
    { height: maxHeight + 'px' },
  ];
  const animOptions = {
    duration: 300,
    fill: 'forwards',
    iterations: 1,
  }
  let rollBtn = null;

  if (maxHeight > rollHeight) {
    initRollElements();
    initStyles();
    toggleElementRoll();
  }

  function initStyles () {
    elem.style = '';
    elem.classList.add('roll-content');
    elem.classList.add('opened');
  }
  function initRollElements () {
    const button = document.createElement('button');
    const mask = document.createElement('div');

    mask.classList.add('roll-mask');
    if (elem.dataset.rollBg) {
      mask.style = `background: linear-gradient(180deg, rgba(255,255,255,0) 0%, ${elem.dataset.rollBg} 100%);`;
    }

    button.type = 'button';
    button.classList.add('roll-btn');
    button.innerHTML = rollTexts.show;
    button.addEventListener('click', toggleElementRoll);

    rollBtn = button;
    elem.parentNode.querySelector('.roll-btn')?.remove();
    elem.querySelector('.roll-mask')?.remove();
    elem.appendChild(mask);
    elem.parentNode.appendChild(button);
  }
  function toggleElementRoll () {
    const action = elem.classList.contains('opened') ? 'close' : 'open';

    if (action == 'open') {
      elem.animate(animKF, animOptions);
      elem.classList.add('opened');
      rollBtn.innerHTML = rollTexts.hide;
    }

    if (action == 'close') {
      elem.animate([...animKF].reverse(), animOptions);
      elem.classList.remove('opened');
      rollBtn.innerHTML = rollTexts.show;
    }
  }
}

function disableRoll (elem) {
  const wrapper = elem.parentNode;
  const removeItems = ['.roll-btn', '.roll-mask'];

  removeItems.forEach(selector => {
    wrapper.querySelectorAll(selector)?.forEach(el => el.remove());
  });

  elem.style = 'height: auto !important;';
  elem.classList.remove('roll-content');
  elem.classList.remove('opened');
}

function initRollHandler (elem) {
  const maxBp = elem.dataset.maxBp;
  const windowWidth = window.innerWidth;
  let doLoad = true;

  if (maxBp && maxBp <= windowWidth) doLoad = false;

  if (!doLoad) {
    disableRoll(elem);
    return;
  };

  initRoll(elem);
}

  const notifications = document.querySelectorAll('.notification');

notifications.forEach(el => initNotificationHandler(el));

function initNotification (wrapper) {
  const closeBtn = wrapper.querySelector('.notification__close-btn');
  const notificationName = wrapper.dataset.name;

  closeBtn.onclick = (e) => {
    e.preventDefault();

    if (notificationName) {
      localStorage.setItem(notificationName, true);
    }

    wrapper.classList.add('close');
    setTimeout(() => wrapper.remove(), 500);
  }
}

function initNotificationHandler (wrapper) {
  const showed = localStorage.getItem(wrapper.dataset.name);

  if (showed) {
    wrapper.remove();
    return;
  }

  initNotification(wrapper);
}

  const mobileNav = document.getElementById('mobile-nav');

function updateMobileNavPlaceholder () {
  insertPlaceholder(mobileNav, 'mobile-nav-placeholder', false);
}
updateMobileNavPlaceholder();
window.addEventListener('resize', updateMobileNavPlaceholder);

  const tabsCompononents = document.querySelectorAll('.tabs');
tabsCompononents.forEach(tabs => initTabs(tabs));
window.addEventListener('resize', () => {
  tabsCompononents.forEach(tabs => initTabs(tabs));
});

function initTabs (tabsComponent) {
  const animDuration = 200;
  const tabAnimOptions = {
    duration: animDuration,
    easing: 'cubic-bezier(.25,.75,.5,1)',
    fill: 'forwards',
  }

  const tabsWrapper = tabsComponent.querySelector('.tabs__content');
  const tabs = tabsComponent.querySelectorAll('[data-tab]');
  const controllsWrapper = tabsComponent.querySelector('.tabs__controlls');
  const controlls = [];
  let curTab = null;
  let inputAvailable = true;

  const generateControlls = () => {
    controllsWrapper.innerHTML = '';

    tabs.forEach(tab => {
      const button  = document.createElement('button');

      button.classList.add('btn', 'tabs__btn');
      button.innerHTML = tab.dataset.tabName;
      button.dataset.tabOpen = tab.dataset.tab;
      button.onclick = () => openTab(tab);

      controlls.push(button);
      controllsWrapper.appendChild(button);
    });
  }
  const closeTabs = () => {
    controlls.forEach(controll => controll.classList.remove('active'));
    tabs.forEach(tab => {
      tab.classList.remove('active');
      tab.classList.remove('finished');
    });
  }
  const closeTab = async (tab, nextTab = {}) => {
    return new Promise((resolve) => {
      tabsWrapper.style.minHeight = nextTab.scrollHeight < tab.scrollHeight ? nextTab.scrollHeight + 'px' : tab.scrollHeight + 'px';
      controlls.find(controll => controll.dataset.tabOpen === tab.dataset.tab)?.classList.remove('active');
      tab.classList.remove('active');
      tab.classList.remove('finished')
      tab.animate({
        height: '0px',
      }, tabAnimOptions);

      setTimeout(() => resolve(), animDuration);
    })
  }
  const openTab = async (tab) => {
    if (!tab || (tab === curTab) || !inputAvailable) return;

    inputAvailable = false;

    if (curTab) { await closeTab(curTab, tab); }

    controlls.find(controll => controll.dataset.tabOpen === tab.dataset.tab)?.classList.add('active');
    tab.classList.add('active');
    tab.animate(
      {
        height: tab.scrollHeight + 'px',
      },
      tabAnimOptions
    ).finished.then(() => {
      tab.classList.add('finished');
      inputAvailable = true;
    });

    curTab = tab;
  }

  generateControlls();
  closeTabs();
  openTab(tabs[0]);
}


  initFixedElements();
});
