import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const SENSE_OF_URGENCY_HEALING_INCREASE = 0.25;
const START_EXTRA_HEROISM_UPTIME = 1/(1+0.75); // We only count healing increases ater this % of the hero has passed. 

const HEROISM_30_PERCENT = [
    32182, // Heroism
    2825,  // Bloodlust
    80353, // Timewarp
    160452,// Netherwinds
    90355, // Ancient hysteria
]

const HEROISM_25_PERCENT = [
    146555, // Drums of Rage
    230935, // Drums of the mountain
]

const SPELLS_SCALING_WITH_HASTE = [
    SPELLS.HEALING_RAIN_HEAL.id,
    SPELLS.HEALING_WAVE.id,
    SPELLS.HEALING_SURGE.id,
    SPELLS.CHAIN_HEAL.id,
    SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
    SPELLS.HEALING_TIDE_TOTEM_HEAL.id,
    SPELLS.ANCESTRAL_GUIDANCE_HEAL.id,
    SPELLS.ASCENDANCE_HEAL.id,
    SPELLS.CLOUDBURST_TOTEM_HEAL.id,
    SPELLS.QUEENS_DECREE.id,
    SPELLS.TIDAL_TOTEM.id,

]


class UncertainReminder extends Module {

  encounterStart = null;
  heroismStart = null;
  hastePercent = null;
  events = [];
  lastHeal = null;

  urgencyHealing = 0;
  hasteHealing = 0;


  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasHead(ITEMS.UNCERTAIN_REMINDER.id);
    }
  }

  // See if we have heroism when the boss is engaged (prelust)
  on_combatantinfo(event) {
  }

  process_events(start, end, combatEnded) {
      
    const duration = end - start;
    var startExtraHeroTime = null;
      
    if (combatEnded) { 
      // If the fight ended with hero up, we assume there were no mechanic shortening hero duration.
      startExtraHeroTime = start + 40000;
    } else {
      // If the hero ended inside the fight, we start at 4/7th of the hero uptime.
      startExtraHeroTime = start + duration * START_EXTRA_HEROISM_UPTIME;
    }


    this.events.forEach((event) => {
        if (event.timestamp > startExtraHeroTime) {

          const spellId = event.ability.guid; 

          if (SPELLS_SCALING_WITH_HASTE.indexOf(spellId) > -1) {
            const increase = (1+this.hastePercent) * (1+SENSE_OF_URGENCY_HEALING_INCREASE) - 1;
            this.urgencyHealing += calculateEffectiveHealing(event, increase);
          } else {
            this.urgencyHealing += calculateEffectiveHealing(event, SENSE_OF_URGENCY_HEALING_INCREASE);
          }
        }
    });


    this.events = [];
  }

  on_encounterstart(event) {
    // We apply heroism at the start incase it was popped before the pull. If we see it's 
    // applied before it drops, we discard all the events.
    this.heroismStart = event.timestamp;
    this.hastePercent = 0.30;
    this.events = [];
  }
  
  on_toPlayer_applybuff(event) {

      const spellId = event.ability.guid; 

      if (HEROISM_30_PERCENT.indexOf(spellId) > -1){
         this.heroismStart = event.timestamp;
         this.hastePercent = 0.30;
         this.events = [];
      }

      if (HEROISM_25_PERCENT.indexOf(spellId) > -1){
         this.heroismStart = event.timestamp;
         this.hastePercent = 0.25;
         this.events = [];
      }
  }

  on_toPlayer_removebuff(event) {

      const spellId = event.ability.guid; 

      if (HEROISM_30_PERCENT.indexOf(spellId) > -1){
         this.process_events(this.heroismStart, event.timestamp);
         this.heroismStart = null;
         this.hastePercent = null;
      }

      if (HEROISM_25_PERCENT.indexOf(spellId) > -1){
         this.process_events(this.heroismStart, event.timestamp);
         this.heroismStart = null;
         this.hastePercent = null;
      }
  }

  // If the fight ends before heroism drops, make sure to process all the pushed events.
  on_finished(event) {
    if (this.heroismStart) {
      this.process_events(this.heroismStart, this.lastHeal || this.heroismStart, true);
    }
  }


  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (!this.heroismStart){
        return;
    }

    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    this.events.push(event);
    this.lastHeal = event.timestamp;
  }

}

export default UncertainReminder;
