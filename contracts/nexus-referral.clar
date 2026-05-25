;; nexus-referral.clar - Referral tracking for Nexus Protocol
;; Users register a referrer once. Referrer count tracked on-chain.
;; Anti-abuse: no self-referral, one referrer per address.

(define-constant err-self-referral    (err u400))
(define-constant err-already-referred (err u401))
(define-constant err-not-found        (err u402))

;; referred -> referrer
(define-map referrals principal principal)
;; referrer -> count of successful referrals
(define-map referral-counts principal uint)

;; ── Read-only ─────────────────────────────────────────────────────────────────

(define-read-only (get-referrer (user principal))
  (map-get? referrals user)
)

(define-read-only (get-referral-count (referrer principal))
  (default-to u0 (map-get? referral-counts referrer))
)

(define-read-only (has-referrer (user principal))
  (is-some (map-get? referrals user))
)

;; ── Public ────────────────────────────────────────────────────────────────────

(define-public (register-referral (referrer principal))
  (begin
    (asserts! (not (is-eq tx-sender referrer)) err-self-referral)
    (asserts! (not (has-referrer tx-sender)) err-already-referred)
    (map-set referrals tx-sender referrer)
    (map-set referral-counts referrer (+ (get-referral-count referrer) u1))
    (print { event: "referral", referred: tx-sender, referrer: referrer })
    (ok true)
  )
)
