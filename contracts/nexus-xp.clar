;; nexus-xp.clar - XP and reputation system for Nexus Protocol
;; Awards XP for protocol actions. Tiers computed read-only.
;; Authorized callers (other Nexus contracts) can award XP.

(define-constant CONTRACT-OWNER tx-sender)
(define-constant err-unauthorized (err u300))
(define-constant err-invalid-amount (err u301))

;; XP balances per user
(define-map xp-balances principal uint)

;; Authorized contracts that can award XP
(define-map authorized-callers principal bool)

;; ── Read-only ─────────────────────────────────────────────────────────────────

(define-read-only (get-xp (user principal))
  (default-to u0 (map-get? xp-balances user))
)

(define-read-only (get-tier (user principal))
  (let ((x (get-xp user)))
    (if (>= x u5000) "Legendary"
    (if (>= x u1000) "Diamond"
    (if (>= x u500)  "Gold"
    (if (>= x u100)  "Silver"
                     "Bronze"))))
  )
)

(define-read-only (is-authorized (caller principal))
  (default-to false (map-get? authorized-callers caller))
)

;; ── Public ────────────────────────────────────────────────────────────────────

(define-public (award-xp (user principal) (amount uint))
  (begin
    (asserts! (or (is-eq tx-sender CONTRACT-OWNER) (is-authorized tx-sender)) err-unauthorized)
    (asserts! (> amount u0) err-invalid-amount)
    (map-set xp-balances user (+ (get-xp user) amount))
    (print { event: "xp-awarded", user: user, amount: amount, total: (get-xp user) })
    (ok (get-xp user))
  )
)

(define-public (authorize-caller (caller principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) err-unauthorized)
    (map-set authorized-callers caller true)
    (ok true)
  )
)

(define-public (revoke-caller (caller principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) err-unauthorized)
    (map-delete authorized-callers caller)
    (ok true)
  )
)
