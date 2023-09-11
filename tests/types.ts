import { Event } from '../wrappers/Event';
import { CopyTrading } from '../wrappers/CopyTrading';
import { BugDetector } from '../wrappers/BugDetector';
import { BlacklistPublisher } from '../wrappers/BlacklistPublisher';

export type ProtocolContract = Event | CopyTrading | BugDetector | BlacklistPublisher;
