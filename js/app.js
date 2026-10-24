/* ============================================================
   app.js — interactions de la galerie SlowSite (Avec Calendrier)
   Indépendant — Aucune dépendance externe (UIKit supprimé)
   ============================================================ */
(function () {
  'use strict';

  /* Construit le calendrier d'activité : 53 semaines de 7 jours, la teinte de chaque case reflétant le nombre de prises de vue archivées ce jour-là. */
  function buildActivityCalendar() {
    var host = document.querySelector('#calendrier');
    if (!host) return;

    var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    // On s'ancre sur l'année actuelle 2026
    var fin = new Date(Date.UTC(2026, 8, 30));
    var frag = document.createDocumentFragment();

    for (var i = 370; i >= 0; i--) {
      var jour = new Date(fin.getTime() - i * 86400000);
      var n = activite(jour);
      var cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.setAttribute('data-n', String(n));
      cell.title = n === 0 ? 'Aucune prise de vue le ' + jour.getUTCDate() + ' ' + MOIS[jour.getUTCMonth()] : n + ' prise' + (n > 1 ? 's' : '') + ' de vue le ' + jour.getUTCDate() + ' ' + MOIS[jour.getUTCMonth()];
      frag.appendChild(cell);
    }
    host.innerHTML = ''; // Nettoie le conteneur avant injection
    host.appendChild(frag);
  }

  /* Niveau d'activité d'une journée, de 0 à 4. Les sorties sont plus nombreuses le week-end et à la belle saison. */
  function activite(jour) {
    var j = jour.getUTCDay();
    var mois = jour.getUTCMonth();
    var graine = (jour.getUTCFullYear() * 372 + mois * 31 + jour.getUTCDate()) * 2654435761;
    var bruit = ((graine >>> 13) % 100) / 100;
    var poids = (j === 0 || j === 6 ? 0.45 : 0.12) + (mois >= 4 && mois <= 8 ? 0.28 : 0.05) + bruit * 0.45;
    
    if (poids < 0.35) return 0;
    if (poids < 0.6) return 1;
    if (poids < 0.8) return 2;
    if (poids < 0.95) return 3;
    return 4;
  }

  /* Filtre la galerie sur les mots-clés associés à chaque visuel. */
  function filterGallery() {
    var champ = document.querySelector('#q');
    var info = document.querySelector('#filter-info');
    if (!champ) return;

    var q = champ.value.trim().toLowerCase();
    var cards = document.querySelectorAll('.card');
    var visibles = 0;

    for (var i = 0; i < cards.length; i++) {
      var mots = (cards[i].getAttribute('data-mots') || '').toLowerCase();
      var match = !q || mots.indexOf(q) !== -1;
      cards[i].style.display = match ? '' : 'none';
      if (match) visibles++;
    }

    if (info) {
      if (!q) {
        info.textContent = '';
      } else if (!visibles) {
        info.textContent = 'Aucun visuel de la sélection pour « ' + champ.value.trim() + ' »';
      } else {
        info.textContent = visibles + ' visuel' + (visibles > 1 ? 's' : '') + ' sur ' + cards.length;
      }
    }
  }

  /* Anime l'arrivée des cartes dans le viewport, ajuste leur hauteur et gère l'opacité du calendrier au scroll. */
  function revealCards() {
    var cards = document.querySelectorAll('.card');
    
    if (cards.length > 0) {
      // Optimisation de la hauteur des cartes
      var tallest = 0;
      for (var j = 0; j < cards.length; j++) {
        if (cards[j].offsetHeight > tallest) {
          tallest = cards[j].offsetHeight;
        }
      }

      for (var i = 0; i < cards.length; i++) {
        cards[i].style.minHeight = tallest + 'px';
        var rect = cards[i].getBoundingClientRect();

        if (rect.top < window.innerHeight - 40) {
          cards[i].classList.add('visible');
          cards[i].style.transform = 'translateY(0px)';
        } else {
          cards[i].style.transform = 'translateY(24px)';
        }
      }
    }

    // Effet d'apparition progressive sur les cases du calendrier à l'approche
    var jours = document.querySelectorAll('.cal-day');
    for (var k = 0; k < jours.length; k++) {
      var box = jours[k].getBoundingClientRect();
      var d = Math.abs(box.top - window.innerHeight / 2);
      jours[k].style.opacity = Math.max(0.15, 1 - d / window.innerHeight);
    }
  }

  /* Affiche les images une fois chargées. */
  function watchImages() {
    document.querySelectorAll('.card img').forEach(function (img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('loaded');
        });
      }
    });
  }

  // Initialisation au chargement du DOM
  function init() {
    buildActivityCalendar();
    watchImages();
    revealCards();
    
    var champ = document.querySelector('#q');
    if (champ) champ.addEventListener('input', filterGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Événements globaux
  window.addEventListener('scroll', revealCards);
  window.addEventListener('resize', revealCards);
  window.addEventListener('load', revealCards);
})();
