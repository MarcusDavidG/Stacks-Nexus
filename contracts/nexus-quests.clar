;; nexus-quests.clar - Quest/achievement system for Nexus Protocol
;; Users claim quests once completed. Each quest has an ID and XP reward.
;; Frontend verifies eligibility off-chain before calling claim.

(define-constant CONTRACT-OWNER tx-sender)
(define-constant err-already-claimed (err u600))
(define-constant err-unauthorized    (err u601))
(define-constant err-not-found       (err u602))

;; Quest definitions: id -> { name, xp-reward, active }
(define-map quests uint { name: (string-ascii 60), xp: uint, active: bool })
;; Completion tracking: { user, quest } -> true
(define-map completions { user: principal, quest: uint } bool)

(define-data-var quest-count uint u0)

;; ── Read-only ─────────────────────────────────────────────────────────────────

(define-read-only (get-quest (id uint))
  (map-get? quests id)
)

(define-read-only (is-completed (user principal) (quest-id uint))
  (default-to false (map-get? completions { user: user, quest: quest-id }))
)

(define-read-only (get-quest-count)
  (var-get quest-count)
)

;; ── Public ────────────────────────────────────────────────────────────────────

(define-public (create-quest (name (string-ascii 60)) (xp uint))
  (let ((id (var-get quest-count)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) err-unauthorized)
    (map-set quests id { name: name, xp: xp, active: true })
    (var-set quest-count (+ id u1))
    (print { event: "quest-created", id: id, name: name, xp: xp })
    (ok id)
  )
)

(define-public (claim-quest (quest-id uint))
  (let ((quest (unwrap! (map-get? quests quest-id) err-not-found)))
    (asserts! (get active quest) err-not-found)
    (asserts! (not (is-completed tx-sender quest-id)) err-already-claimed)
    (map-set completions { user: tx-sender, quest: quest-id } true)
    (print { event: "quest-claimed", user: tx-sender, quest: quest-id, xp: (get xp quest) })
    (ok (get xp quest))
  )
)
