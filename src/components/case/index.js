// Every component the .mdx files may use, passed to <Content components>,
// so the content files need no imports. Plus overrides for ## and tables.
import BeforeAfter from './BeforeAfter.astro';
import Claim from './Claim.astro';
import Claims from './Claims.astro';
import Decision from './Decision.astro';
import DeeperIntro from './DeeperIntro.astro';
import DeviceStrip from './DeviceStrip.astro';
import Figure from './Figure.astro';
import Gallery from './Gallery.astro';
import GoDeeper from './GoDeeper.astro';
import Loop from './Loop.astro';
import Moment from './Moment.astro';
import MomentStrip from './MomentStrip.astro';
import Need from './Need.astro';
import Note from './Note.astro';
import Quote from './Quote.astro';
import SectionTitle from './SectionTitle.astro';
import Snapshot from './Snapshot.astro';
import State from './State.astro';
import States from './States.astro';
import Table from './Table.astro';
import Timeline from './Timeline.astro';

export const components = {
  BeforeAfter, Claim, Claims, Decision, DeeperIntro, DeviceStrip, Figure, Gallery,
  GoDeeper, Loop, Moment, MomentStrip, Need, Note, Quote, Snapshot, State, States, Timeline,
  h2: SectionTitle,
  table: Table,
};
