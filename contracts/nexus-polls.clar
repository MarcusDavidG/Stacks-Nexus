;; nexus-polls.clar - Lightweight on-chain polling
;; Owner creates polls; any wallet votes once per poll

(define-constant CONTRACT-OWNER tx-sender)
(define-constant err-unauthorized  (err u500))
(define-constant err-inactive      (err u501))
(define-constant err-already-voted (err u502))
(define-constant err-not-found     (err u503))

(define-data-var poll-count uint u0)

(define-map polls uint {
  question: (string-ascii 120),
  option-a: (string-ascii 60),
  option-b: (string-ascii 60),
  votes-a:  uint,
  votes-b:  uint,
  active:   bool
})

(define-map votes { poll: uint, voter: principal } bool)

(define-read-only (get-poll (id uint))
  (map-get? polls id)
)

(define-read-only (has-voted (id uint) (user principal))
  (default-to false (map-get? votes { poll: id, voter: user }))
)

(define-read-only (get-poll-count)
  (var-get poll-count)
)

(define-public (create-poll
    (question (string-ascii 120))
    (option-a (string-ascii 60))
    (option-b (string-ascii 60)))
  (let ((id (var-get poll-count)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) err-unauthorized)
    (map-set polls id {
      question: question,
      option-a: option-a,
      option-b: option-b,
      votes-a:  u0,
      votes-b:  u0,
      active:   true
    })
    (var-set poll-count (+ id u1))
    (print { event: "poll-created", id: id, question: question })
    (ok id)
  )
)

(define-public (vote (poll-id uint) (choice bool))
  (let ((poll (unwrap! (map-get? polls poll-id) err-not-found)))
    (asserts! (get active poll) err-inactive)
    (asserts! (not (has-voted poll-id tx-sender)) err-already-voted)
    (map-set votes { poll: poll-id, voter: tx-sender } true)
    (map-set polls poll-id (merge poll {
      votes-a: (if choice (get votes-a poll) (+ (get votes-a poll) u1)),
      votes-b: (if choice (+ (get votes-b poll) u1) (get votes-b poll))
    }))
    (print { event: "vote", poll: poll-id, voter: tx-sender, choice: choice })
    (ok true)
  )
)

(define-public (close-poll (poll-id uint))
  (let ((poll (unwrap! (map-get? polls poll-id) err-not-found)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) err-unauthorized)
    (map-set polls poll-id (merge poll { active: false }))
    (ok true)
  )
)
