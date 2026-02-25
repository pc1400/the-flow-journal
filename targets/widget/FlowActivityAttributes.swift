import ActivityKit
import Foundation

public struct FlowActivityAttributes: ActivityAttributes {
    public var exerciseName: String
    public var exerciseId: Int
    public var deepLinkUrl: String

    public struct ContentState: Codable, Hashable {
        public var currentSetNumber: Int
        public var lastSetWeight: Double?
        public var lastSetReps: Int?
        public var ghostWeight: Double?
        public var ghostReps: Int?
        public var isComplete: Bool
    }
}
