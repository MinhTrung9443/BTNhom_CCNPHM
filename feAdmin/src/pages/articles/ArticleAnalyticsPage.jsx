import React, { useEffect } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchArticleAnalytics } from '../../redux/slices/articlesSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const ArticleAnalyticsPage = () => {
  const dispatch = useDispatch()
  const { analytics, loading } = useSelector((state) => state.articles)

  useEffect(() => {
    dispatch(fetchArticleAnalytics())
  }, [dispatch])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!analytics) {
    return (
      <Container fluid>
        <div className="text-center py-5 text-muted">
          <i className="bi bi-bar-chart" style={{ fontSize: '3rem' }}></i>
          <p className="mt-2">Không có dữ liệu phân tích</p>
        </div>
      </Container>
    )
  }

  // Mock data for demonstration - replace with actual analytics data
  const totalArticles = analytics.totalArticles || 0
  const totalViews = analytics.totalViews || 0
  const totalLikes = analytics.totalLikes || 0
  const totalComments = analytics.totalComments || 0
  const totalShares = analytics.totalShares || 0

  const viewsChartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Lượt xem',
        data: analytics.viewsByDay || [120, 190, 300, 250, 200, 300, 400],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  }

  const engagementChartData = {
    labels: analytics.topArticles?.map(a => a.title.substring(0, 20) + '...') || ['Bài viết 1', 'Bài viết 2', 'Bài viết 3'],
    datasets: [
      {
        label: 'Lượt thích',
        data: analytics.topArticles?.map(a => a.stats.likes) || [45, 38, 32],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Bình luận',
        data: analytics.topArticles?.map(a => a.stats.comments) || [12, 19, 15],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  const statusChartData = {
    labels: ['Đã xuất bản', 'Nháp', 'Lưu trữ'],
    datasets: [
      {
        data: [
          analytics.articlesByStatus?.published || 0,
          analytics.articlesByStatus?.draft || 0,
          analytics.articlesByStatus?.archived || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <Container fluid>
      <h2 className="fw-bold mb-4">Phân tích bài viết</h2>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Tổng bài viết</p>
                  <h3 className="mb-0">{totalArticles}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-file-text text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Tổng lượt xem</p>
                  <h3 className="mb-0">{totalViews.toLocaleString()}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-eye text-success" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Tổng lượt thích</p>
                  <h3 className="mb-0">{totalLikes}</h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="bi bi-heart text-danger" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Tổng bình luận</p>
                  <h3 className="mb-0">{totalComments}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-chat text-info" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Lượt xem theo ngày</h5>
            </Card.Header>
            <Card.Body>
              <Line data={viewsChartData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Trạng thái bài viết</h5>
            </Card.Header>
            <Card.Body>
              <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Tương tác theo bài viết</h5>
            </Card.Header>
            <Card.Body>
              <Bar data={engagementChartData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ArticleAnalyticsPage
