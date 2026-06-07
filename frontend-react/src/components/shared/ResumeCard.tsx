import JoinedCourseCard, { type JoinedCourseCardSize } from './JoinedCourseCard'
import type { JoinedCourse } from '@/lib/types/user'

type ResumeCardProps = {
  data: JoinedCourse
  size?: JoinedCourseCardSize
}

const ResumeCard = ({ data, size = 'md' }: ResumeCardProps) => (
  <JoinedCourseCard data={data} variant="resume" size={size} />
)

export default ResumeCard
