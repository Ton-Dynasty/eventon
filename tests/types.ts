import { Event } from '../wrappers/Event';
import { CopyTrading } from '../wrappers/CopyTrading';
import { BugDetector } from '../wrappers/BugDetector';
import { BlacklistPublisher } from '../wrappers/BlacklistPublisher';
import { UniversalRouter } from '../wrappers/UniversalRouter';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';
import { Messenger } from '../wrappers/Messenger';

export type ProtocolContract = Event | CopyTrading | BugDetector | BlacklistPublisher;
export type BaseContract = ProtocolContract | UniversalRouter | UserDefaultCallback | Messenger;
