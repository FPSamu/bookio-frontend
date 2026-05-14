import api from './api'

/**
 * Fetch all reviews the current user has left.
 * GET /reviews/mine
 */
export async function getMyReviews() {
  const { data } = await api.get('/reviews/mine')
  return data.reviews ?? data ?? []
}

/**
 * Fetch the review for a specific appointment (null if not yet reviewed).
 * GET /reviews/appointment/:appointmentId
 */
export async function getReviewByAppointment(appointmentId) {
  const { data } = await api.get(`/reviews/appointment/${appointmentId}`)
  return data.review ?? data ?? null
}

/**
 * Submit a new review.
 * POST /reviews
 */
export async function submitReview({ appointmentId, businessId, clientId, score, comment }) {
  const { data } = await api.post('/reviews', { appointmentId, businessId, clientId, score, comment })
  return data
}
