;; nexus-checkin.clar — Daily check-in with streak tracking
;; Each wallet can check in once per block; streak increments if within 2 days (~288 blocks)

(define-constant BLOCKS-PER-DAY u144)
(define-constant err-too-soon (err u200))

(define-map streaks principal { last-block: uint, count: uint, total: uint })

(define-read-only (get-streak (user principal))
  (default-to { last-block: u0, count: u0, total: u0 } (map-get? streaks user))
)

(define-public (check-in)
  (let (
    (data    (get-streak tx-sender))
    (last    (get last-block data))
    (current stacks-block-height)
    (gap     (- current last))
    (new-count (if (and (> last u0) (<= gap (* BLOCKS-PER-DAY u2)))
                 (+ (get count data) u1)
                 u1))
  )
    (asserts! (>= gap u1) err-too-soon)
    (map-set streaks tx-sender {
      last-block: current,
      count:      new-count,
      total:      (+ (get total data) u1)
    })
    (print { event: "check-in", user: tx-sender, streak: new-count, block: current })
    (ok new-count)
  )
)
