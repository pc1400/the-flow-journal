import ExpoModulesCore
import ActivityKit

public class LiveActivityModule: Module {
    private var currentActivityId: String?

    public func definition() -> ModuleDefinition {
        Name("LiveActivity")

        Function("startActivity") { (params: [String: Any]) -> String? in
            guard #available(iOS 16.2, *) else { return nil }
            guard ActivityAuthorizationInfo().areActivitiesEnabled else { return nil }

            let exerciseName = params["exerciseName"] as? String ?? ""
            let exerciseId = params["exerciseId"] as? Int ?? 0
            let deepLinkUrl = params["deepLinkUrl"] as? String ?? ""
            let ghostWeight = params["ghostWeight"] as? Double
            let ghostReps = params["ghostReps"] as? Int

            let attributes = FlowActivityAttributes(
                exerciseName: exerciseName,
                exerciseId: exerciseId,
                deepLinkUrl: deepLinkUrl
            )

            let state = FlowActivityAttributes.ContentState(
                currentSetNumber: 1,
                lastSetWeight: nil,
                lastSetReps: nil,
                ghostWeight: ghostWeight,
                ghostReps: ghostReps,
                isComplete: false
            )

            do {
                let activity = try Activity.request(
                    attributes: attributes,
                    content: .init(state: state, staleDate: nil),
                    pushType: nil
                )
                self.currentActivityId = activity.id
                return activity.id
            } catch {
                return nil
            }
        }

        Function("updateActivity") { (params: [String: Any]) -> Bool in
            guard #available(iOS 16.2, *) else { return false }
            guard let activityId = self.currentActivityId else { return false }

            let setNumber = params["currentSetNumber"] as? Int ?? 1
            let lastWeight = params["lastSetWeight"] as? Double
            let lastReps = params["lastSetReps"] as? Int
            let ghostWeight = params["ghostWeight"] as? Double
            let ghostReps = params["ghostReps"] as? Int

            let state = FlowActivityAttributes.ContentState(
                currentSetNumber: setNumber,
                lastSetWeight: lastWeight,
                lastSetReps: lastReps,
                ghostWeight: ghostWeight,
                ghostReps: ghostReps,
                isComplete: false
            )

            let activity = Activity<FlowActivityAttributes>.activities.first { $0.id == activityId }
            guard let activity = activity else { return false }

            Task {
                await activity.update(.init(state: state, staleDate: nil))
            }
            return true
        }

        Function("endActivity") { () -> Bool in
            guard #available(iOS 16.2, *) else { return false }
            guard let activityId = self.currentActivityId else { return false }

            let activity = Activity<FlowActivityAttributes>.activities.first { $0.id == activityId }
            guard let activity = activity else { return false }

            let finalState = FlowActivityAttributes.ContentState(
                currentSetNumber: activity.content.state.currentSetNumber,
                lastSetWeight: activity.content.state.lastSetWeight,
                lastSetReps: activity.content.state.lastSetReps,
                ghostWeight: nil,
                ghostReps: nil,
                isComplete: true
            )

            Task {
                await activity.end(.init(state: finalState, staleDate: nil), dismissalPolicy: .immediate)
            }
            self.currentActivityId = nil
            return true
        }

        Function("areActivitiesEnabled") { () -> Bool in
            guard #available(iOS 16.2, *) else { return false }
            return ActivityAuthorizationInfo().areActivitiesEnabled
        }
    }
}
