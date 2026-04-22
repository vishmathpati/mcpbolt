import Foundation
import Combine

// MARK: - Central place for which "full-screen" overlay view is shown inside
// the popover. Popovers + SwiftUI sheets don't mix well (the sheet detaches
// into its own window), so we use state-driven view replacement instead.

@MainActor
final class OverlayPresenter: ObservableObject {
    enum Overlay: Equatable {
        case none
        case importSheet
        case editServer(toolID: String, toolLabel: String, serverName: String)
        case editServerInProject(projectRoot: String, toolID: String, toolLabel: String, serverName: String)
        case copyToApps(toolID: String, toolLabel: String, serverName: String)
    }

    @Published var overlay: Overlay = .none

    func show(_ o: Overlay) { overlay = o }
    func dismiss()          { overlay = .none }

    var isShowing: Bool { overlay != .none }
}
