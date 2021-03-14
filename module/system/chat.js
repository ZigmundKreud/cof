/**
 * Highlight critical success or failure on d20 rolls
 */
export const highlightCriticalSuccessFailure = function(message, html, data) {
    if ( !message.isRoll || !message.isContentVisible ) return;
  
    // Highlight rolls where the first part is a d20 roll
    const roll = message.roll;
    if ( !roll.dice.length ) return;
    const d = roll.dice[0];
  
    // Ensure it is an un-modified d20 roll
    const isD20 = (d.faces === 20) && ( d.values.length === 1 );
    if ( !isD20 ) return;
    const isModifiedRoll = ("success" in d.results[0]) || d.options.marginSuccess || d.options.marginFailure;
    if ( isModifiedRoll ) return;
  
    // Highlight successes and failures
    const critical = d.options.critical || 20;
    const fumble = d.options.fumble || 1;
    if ( d.total >= critical ) html.find(".dice-total").addClass("critical");
    else if ( d.total <= fumble ) html.find(".dice-total").addClass("fumble");
  };