/**
 * Player profile flip cards & match sliders (jQuery)
 */
(function ($) {
  function t(key) {
    return window.I18n?.t(key) ?? key;
  }

  function resetPlayerCardUI($card) {
    $card.find('.player-flip-card').removeClass('is-flipped');
    const $drawer = $card.find('.player-matches-drawer');
    $drawer.removeClass('is-open');
    $drawer.find('.matches-drawer-panel').stop(true, true).hide().attr('hidden', true);
    $drawer.find('.matches-expand-btn').attr('aria-expanded', 'false');
    $drawer.find('.matches-expand-label').text(t('players.viewLastFive'));
    $card.find('.match-slides-track').css('transform', 'translateX(0)');
    $card.find('.match-dot').removeClass('active').first().addClass('active');
  }

  function initMatchSlider($card) {
    const $track = $card.find('.match-slides-track');
    const slideCount = $track.find('.match-slide').length;
    if (slideCount <= 1) {
      $card.find('.match-nav').prop('disabled', true).addClass('is-hidden');
    }

    let index = 0;

    function goTo(nextIndex) {
      index = (nextIndex + slideCount) % slideCount;
      $track.css('transform', `translateX(-${index * 100}%)`);
      $card.find('.match-dot').removeClass('active').eq(index).addClass('active');
    }

    $card.find('.match-nav.prev').off('click.matchNav').on('click.matchNav', (e) => {
      e.stopPropagation();
      goTo(index - 1);
    });

    $card.find('.match-nav.next').off('click.matchNav').on('click.matchNav', (e) => {
      e.stopPropagation();
      goTo(index + 1);
    });

    $card.find('.match-dot').off('click.matchDot').on('click.matchDot', function (e) {
      e.stopPropagation();
      goTo(Number($(this).data('index')));
    });

    let touchStart = 0;
    $card.find('.match-slides-viewport').off('touchstart.matchSwipe touchend.matchSwipe')
      .on('touchstart.matchSwipe', (e) => {
        touchStart = e.originalEvent.touches[0].clientX;
      })
      .on('touchend.matchSwipe', (e) => {
        const delta = e.originalEvent.changedTouches[0].clientX - touchStart;
        if (Math.abs(delta) < 40) return;
        goTo(delta > 0 ? index - 1 : index + 1);
      });
  }

  function bindPlayerCards() {
    $(document).off('click.playerFlip keydown.playerFlip', '.player-flip-card')
      .on('click.playerFlip', '.player-flip-card', function (e) {
        if ($(e.target).closest('a, button').length) return;
        $(this).toggleClass('is-flipped');
      })
      .on('keydown.playerFlip', '.player-flip-card', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          $(this).toggleClass('is-flipped');
        }
      });

    $(document).off('click.matchesExpand', '.matches-expand-btn')
      .on('click.matchesExpand', '.matches-expand-btn', function (e) {
        e.stopPropagation();
        const $drawer = $(this).closest('.player-matches-drawer');
        const $panel = $drawer.find('.matches-drawer-panel');
        const opening = !$drawer.hasClass('is-open');

        $drawer.toggleClass('is-open', opening);
        $(this).attr('aria-expanded', opening ? 'true' : 'false');
        $(this).find('.matches-expand-label').text(
          opening ? t('players.hideLastFive') : t('players.viewLastFive')
        );

        if (opening) {
          $panel.removeAttr('hidden').hide().slideDown(320);
        } else {
          $panel.slideUp(260, () => $panel.attr('hidden', true));
        }
      });

    $('#playerGrid .player-card').each(function () {
      initMatchSlider($(this));
    });
  }

  window.initPlayerCardsUI = function initPlayerCardsUI() {
    if (!window.jQuery) return;
    bindPlayerCards();
  };

  window.resetPlayerCardUI = function resetCard(el) {
    if (!window.jQuery) return;
    resetPlayerCardUI($(el));
  };

  $(document).ready(() => {
    bindPlayerCards();
  });
})(window.jQuery);
