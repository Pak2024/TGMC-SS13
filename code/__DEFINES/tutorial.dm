/// TGMC tutorial framework.
///
/// This is the shared foundation only. UI, lobby integration, save data,
/// tutorial maps and concrete Marine lessons are added in later stages.

#define TUTORIAL_CATEGORY_GENERAL "General"
#define TUTORIAL_CATEGORY_MARINE "Marine"

#define TUTORIAL_STATUS_ACTIVE 1
#define TUTORIAL_STATUS_COMPLETED 2

/// Tutorial lifecycle signals emitted by /datum/tutorial onto its mob.
#define COMSIG_TUTORIAL_STARTED "tutorial_started"
#define COMSIG_TUTORIAL_COMPLETED "tutorial_completed"
#define COMSIG_TUTORIAL_OBJECTIVE_UPDATED "tutorial_objective_updated"

/// Stable ID used by the first tutorial entry.
#define TUTORIAL_DEFAULT_ID "tgmc_basic"
