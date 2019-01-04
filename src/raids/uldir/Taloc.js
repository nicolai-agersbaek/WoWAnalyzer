import Background from './images/Backgrounds/Taloc.jpg';
import Headshot from './images/Headshots/Taloc.png';

export default {
  id: 2144,
  name: 'Taloc',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_talocthecorrupted',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [
        271811, // Cudgel of Gore
      ],
    },
    phases: [
      {
        id: 1,
        name: 'Stage One: The Corrupted Construct',
      },
      {
        id: 2,
        name: 'Stage Two: Ruin\'s Descent',
        filter: {
          type: 'applybuff',
          ability: {
            id: 271965,
          },
        },
      },
      {
        id: 3,
        name: 'Stage Three: The Bottom Floor',
        filter: {
          type: 'removebuff',
          ability: {
            id: 271965,
          },
        },
      },
    ],
  },
};
