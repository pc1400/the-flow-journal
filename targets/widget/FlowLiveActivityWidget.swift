import ActivityKit
import WidgetKit
import SwiftUI

struct FlowLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FlowActivityAttributes.self) { context in
            // LOCK SCREEN / BANNER view
            LockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // EXPANDED Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(context.attributes.exerciseName)
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                            .lineLimit(1)
                        Text("Set \(context.state.currentSetNumber)")
                            .font(.title2)
                            .bold()
                            .foregroundColor(.white)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if let w = context.state.lastSetWeight,
                       let r = context.state.lastSetReps {
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("Last Set")
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.5))
                            Text("\(String(format: "%.0f", w)) × \(r)")
                                .font(.headline)
                                .bold()
                                .foregroundColor(.white)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if let url = URL(string: context.attributes.deepLinkUrl) {
                        Link(destination: url) {
                            HStack(spacing: 6) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.body)
                                Text("Log Set")
                                    .font(.body)
                                    .bold()
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color.orange)
                            .foregroundColor(.black)
                            .cornerRadius(12)
                        }
                    }
                }
            } compactLeading: {
                Text("Set \(context.state.currentSetNumber)")
                    .font(.caption)
                    .bold()
                    .foregroundColor(.white)
            } compactTrailing: {
                Image(systemName: context.state.isComplete ? "checkmark.circle.fill" : "dumbbell.fill")
                    .foregroundColor(.orange)
                    .font(.caption)
            } minimal: {
                Text("\(context.state.currentSetNumber)")
                    .font(.caption)
                    .bold()
                    .foregroundColor(.orange)
            }
        }
    }
}

// MARK: - Lock Screen / Banner View (Strava-inspired dark theme)

struct LockScreenView: View {
    let context: ActivityViewContext<FlowActivityAttributes>

    var body: some View {
        VStack(spacing: 12) {
            // Header row
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(context.attributes.exerciseName)
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.7))
                    Text("Set \(context.state.currentSetNumber)")
                        .font(.title)
                        .bold()
                        .foregroundColor(.white)
                }
                Spacer()
                // Ghost data badge
                if let gw = context.state.ghostWeight,
                   let gr = context.state.ghostReps {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("TARGET")
                            .font(.caption2)
                            .fontWeight(.heavy)
                            .foregroundColor(.orange.opacity(0.8))
                        Text("\(String(format: "%.0f", gw)) × \(gr)")
                            .font(.headline)
                            .bold()
                            .foregroundColor(.orange)
                    }
                }
            }

            // Last set info
            if let w = context.state.lastSetWeight,
               let r = context.state.lastSetReps {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.subheadline)
                    Text("Last: \(String(format: "%.0f", w)) lbs × \(r) reps")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                }
            }

            // Deep-link "Log Set" button
            if let url = URL(string: context.attributes.deepLinkUrl) {
                Link(destination: url) {
                    HStack(spacing: 6) {
                        Image(systemName: "plus.circle.fill")
                            .font(.body)
                        Text("Log Set")
                            .font(.body)
                            .bold()
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.orange)
                    .foregroundColor(.black)
                    .cornerRadius(12)
                }
            }
        }
        .padding(16)
        .background(Color.black)
    }
}
