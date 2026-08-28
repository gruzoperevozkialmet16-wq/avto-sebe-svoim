(function () {
  'use strict';

  var TG = 'https://t.me/uspevaite_blizkie';

  /* --- шапка --- */
  var header = document.getElementById('header');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- мобильное меню --- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* --- появление блоков --- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var delay = 0;
        var parent = el.parentElement;
        if (parent) {
          var sibs = Array.prototype.filter.call(parent.children, function (c) {
            return c.classList.contains('reveal');
          });
          delay = Math.min(sibs.indexOf(el), 5) * 90;
        }
        setTimeout(function () { el.classList.add('in'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* страховка: если наблюдатель не сработал — показываем всё */
  setTimeout(function () {
    if (!document.querySelector('.reveal.in')) {
      items.forEach(function (el) { el.classList.add('in'); });
    }
  }, 2000);

  /* --- маска телефона --- */
  var phone = document.getElementById('f-phone');
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' ' + d.slice(1, 4);
    if (d.length >= 5) out += ' ' + d.slice(4, 7);
    if (d.length >= 8) out += '-' + d.slice(7, 9);
    if (d.length >= 10) out += '-' + d.slice(9, 11);
    phone.value = out;
    phone.classList.remove('err');
  });

  /* --- отправка заявки --- */
  var form = document.getElementById('leadForm');
  var hint = document.getElementById('formHint');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var digits = phone.value.replace(/\D/g, '');
    if (digits.length < 11) {
      phone.classList.add('err');
      phone.focus();
      hint.textContent = 'Укажите номер телефона — без него мы не сможем перезвонить.';
      hint.classList.remove('ok');
      return;
    }

    var g = function (id) { return (document.getElementById(id).value || '').trim(); };
    var lines = [
      'Заявка с сайта «Авто себе своим близким»',
      'Имя: ' + (g('f-name') || 'не указано'),
      'Телефон: ' + phone.value,
      'Авто: ' + (g('f-car') || 'не указано'),
      'Год: ' + (g('f-year') || 'не указан'),
      'Состояние: ' + g('f-state')
    ];
    if (g('f-note')) lines.push('Комментарий: ' + g('f-note'));
    var text = lines.join('\n');

    var open = function () {
      hint.textContent = 'Заявка скопирована — вставьте её в чат Telegram и отправьте.';
      hint.classList.add('ok');
      window.open(TG, '_blank', 'noopener');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(open, open);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(ta);
      open();
    }
  });
})();
