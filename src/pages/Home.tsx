import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Modal,
  Grid,
  LinearProgress,
  LinearProgressProps
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'
import RateReviewIcon from '@material-ui/icons/RateReview'
import routes from './routes'
import Wrapper from '../components/Wrapper'
import AppBar from '../components/AppBar'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import firebase from '../firebase'
import formErrorMessages from '../utils/formErrorMessages'
import { StringLiteral } from 'typescript'
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { Edit } from '@material-ui/icons'
import EditForm from '../components/EditForm'
import JourneyReview from '../components/JourneyReview'
import { ImageUpload } from '../components/ImageUploader.jsx'
import { makeStyles } from '@material-ui/core/styles'
import { createMuiTheme } from '@material-ui/core/styles'

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import theme from '../theme'

const localizer = momentLocalizer(moment)

let upcomingReviews = [
  { start: new Date(), end: new Date(), title: 'special event' }
]

function LinearProgressWithLabel(props: any) {
  return (
    <Box display='flex' alignItems='center'>
      <Box width='100%' mr={1}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant='body2' color='textSecondary'>{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  )
}

const Home = () => {
  const { register, errors, handleSubmit, reset } = useForm<Journey>()

  var JourneyListEmpty: Journey[] = []
  const [reviewedJourneyList, setReviewedJourneyList] = useState(
    JourneyListEmpty.slice()
  )
  const [toReviewJourneyList, setToReviewJourneyList] = useState(
    JourneyListEmpty.slice()
  )

  const useStyles = makeStyles(theme => ({
    gridBox: {
      flexGrow: 1
    },
    media: {
      height: 140
    },
    card: {
      maxWidth: 345
    },
    rightButton: {
      align: 'right'
    },
    formContainer: {
      padding: theme.spacing(3)
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      backgroundColor: '#47e398'
    }
  }))

  const classes = useStyles()

  const [openEditModal, setOpenEditModal] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)
  const [journeyToEditID, setJourneyToEditID] = useState('')
  const [journeyToReviewID, setJourneyToReviewID] = useState('')
  const [journeyToReviewNextReview, setJourneyToReviewNextReview] = useState(0)
  const [userID, setUserID] = useState('')
  const journeyRef = firebase.database().ref('Journey')

  type Journey = {
    id: string
    userID: string
    title: string
    location: string
    created: number
    reviewed: number
    nextReview: number
    image: string
  }

  useEffect(() => {
    const timer = setInterval(() => {
      getJourneys()
      getUserID()
    }, 100)
    return () => {
      clearInterval(timer)
    }
  })

  const getUserID = () => {
    const userID = firebase.auth().currentUser?.uid || ''
    setUserID(userID)
  }

  const getJourneys = () => {
    const now = new Date().getTime()
    journeyRef
      .orderByChild('userID')
      .equalTo(userID)
      .on('value', snapshot => {
        const journeys = snapshot.val()
        const reviewedList = JourneyListEmpty.slice()
        const toReviewList = JourneyListEmpty.slice()
        let nextReviews = []
        for (let id in journeys) {
          const nextReview = new Date(journeys[id].nextReview)
          nextReviews.push({
            start: nextReview,
            end: nextReview,
            title: journeys[id].title
          })
          if (now > journeys[id].nextReview) {
            toReviewList.push({ id, ...journeys[id] })
          } else {
            reviewedList.push({ id, ...journeys[id] })
          }
        }
        setToReviewJourneyList(toReviewList)
        setReviewedJourneyList(reviewedList)
        upcomingReviews = nextReviews
      })
  }

  const currentUserString = () => {
    if (firebase.auth().currentUser) {
      return 'Welcome ' + firebase.auth().currentUser?.displayName
    }
  }

  const handleJourneyDelete = (id: string) => {
    journeyRef.child(id).remove()
  }

  const createJourneyCard = (journey: Journey) => {
    let cardMedia = () => {
      if (journey.image?.length > 0) {
        return <CardMedia className={classes.media} image={journey.image} />
      }
    }
    return (
      <Grid item>
        <Card className={classes.card}>
          {cardMedia()}
          <CardContent>
            <Typography color='textSecondary' gutterBottom>
              {journey.location}
            </Typography>
            <Typography variant='h5' component='h2'>
              {journey.title}
            </Typography>
            {/* <Typography color='textSecondary'>{journey.location}</Typography> */}
            <Typography variant='body2' component='p'>
              <br />
              Reviewed: {new Date(journey.reviewed).toLocaleString()}
              <br />
              Next Review: {new Date(journey.nextReview).toLocaleString()}
              <br />
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton
              aria-label='review'
              onClick={() => {
                setOpenReviewModal(true)
                setJourneyToReviewID(journey.id)
                const nextReview = (journey.nextReview - journey.reviewed) * 2
                setJourneyToReviewNextReview(nextReview)
              }}
            >
              <RateReviewIcon />
            </IconButton>
            <IconButton
              aria-label='edit'
              onClick={() => {
                setOpenEditModal(true)
                setJourneyToEditID(journey.id)
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label='delete'
              className='rightButton'
              onClick={() => {
                handleJourneyDelete(journey.id)
              }}
            >
              <DeleteForeverIcon />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    )
  }

  const createJourneyCards = (journeyList: Journey[]) => {
    let list = []
    for (let i = 0; i < journeyList.length; i++) {
      list.push(createJourneyCard(journeyList[i]))
    }
    return (
      <Grid container className={classes.gridBox} spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {list}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <AppBar
        title='The Loci Method'
        actions={
          <Button
            color='primary'
            size='small'
            component={Link}
            to={routes.signin}
            variant='contained'
          >
            {userID != '' ? 'Log Out' : 'Sign In or Sign Up'}
          </Button>
        }
      />
      <Modal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false)
        }}
        style={{ width: '80%', position: 'fixed', top: '40%', left: '10%' }}
      >
        <EditForm editID={journeyToEditID} setModal={setOpenEditModal} />
      </Modal>
      <Modal
        open={openReviewModal}
        onClose={() => {
          setOpenReviewModal(false)
        }}
        style={{ width: '80%', position: 'fixed', top: '40%', left: '10%' }}
      >
        <Paper>
          <JourneyReview
            reviewID={journeyToReviewID}
            setModal={setOpenReviewModal}
            nextReview={journeyToReviewNextReview}
          />
        </Paper>
      </Modal>
      <Wrapper>
        <Typography paragraph>{currentUserString()}</Typography>
        <Typography paragraph variant='h3'>
          Create Mind Palaces to Remember Like Never Before
        </Typography>
        <Typography paragraph variant='h6'>
          An ideal mind palace is a brightly lit deserted place with a standard
          rout through it like a museum or school after hours and is filled with
          striking images of people doing an action to encode information with a
          key transition at every fifth image
        </Typography>
        <Typography paragraph>
          Key Vocabulary:
          <br />
          Image - The visual representation of what you are trying to remember
          <br />
          Mind Palace - The visualization or a real or imaginary place where you
          store images
          <br />
          Journey - The mental walk you take through the images you have
          collected in the mind palace
        </Typography>
        <Paper
          style={{
            padding: theme.spacing(1),
            marginBottom: theme.spacing(3),
            backgroundColor: '#6be8ac'
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                {toReviewJourneyList[0] && (
                  <Button
                    aria-label='review'
                    onClick={() => {
                      setOpenReviewModal(true)
                      setJourneyToReviewID(toReviewJourneyList[0].id)
                      const nextReview =
                        (toReviewJourneyList[0].nextReview -
                          toReviewJourneyList[0].reviewed) *
                        2
                      setJourneyToReviewNextReview(nextReview)
                    }}
                  >
                    Review Next Journey: {toReviewJourneyList[0].title}
                  </Button>
                )}
                {!toReviewJourneyList[0] && "No Journey's for Review"}
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>
                Up To Date: {reviewedJourneyList.length}
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>
                For Review: {toReviewJourneyList.length}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <LinearProgressWithLabel
                  value={
                    (reviewedJourneyList.length /
                      (reviewedJourneyList.length +
                        toReviewJourneyList.length)) *
                    100
                  }
                />
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        <Paper>
          <p>
            <Typography paragraph variant='h6'>
              Next for Review
            </Typography>
            <Typography paragraph>
              {toReviewJourneyList[0] && (
                <Button
                  aria-label='review'
                  onClick={() => {
                    setOpenReviewModal(true)
                    setJourneyToReviewID(toReviewJourneyList[0].id)
                    const nextReview =
                      (toReviewJourneyList[0].nextReview -
                        toReviewJourneyList[0].reviewed) *
                      2
                    setJourneyToReviewNextReview(nextReview)
                  }}
                >
                  Review Next Journey: {toReviewJourneyList[0].title}
                </Button>
              )}
              {!toReviewJourneyList[0] && "No Journey's for Review"}
            </Typography>
          </p>
          <p>
            <Typography paragraph variant='h6'>
              Journeys Not up For Review
            </Typography>
            <Typography paragraph>{reviewedJourneyList.length}</Typography>
          </p>
          <p>
            <Typography paragraph variant='h6'>
              Journeys Up For Review
            </Typography>
            <Typography paragraph>{toReviewJourneyList.length}</Typography>
          </p>
          <p>
            <Typography paragraph variant='h6'>
              Progress
            </Typography>
            <LinearProgressWithLabel
              value={
                (reviewedJourneyList.length /
                  (reviewedJourneyList.length + toReviewJourneyList.length)) *
                100
              }
            />
          </p>
        </Paper>
        <Calendar
          localizer={localizer}
          events={upcomingReviews}
          startAccessor='start'
          endAccessor='end'
          style={{ height: 500 }}
        />
        <Paper>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownCircleIcon />}>
              Journeys to Review
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              {createJourneyCards(toReviewJourneyList)}
            </AccordionDetails>
          </Accordion>
        </Paper>
        <p></p>
        <Paper>
          {/* <ImageUpload onRequestSave={(id:any) => setImage(id)}
              onRequestClear={() => setImage('')}/> */}
          <Accordion>
            <AccordionSummary expandIcon={<AddCircleIcon />}>
              Create a Journey
            </AccordionSummary>
            <AccordionDetails>
              <form
                onSubmit={handleSubmit(vals => {
                  vals.userID = firebase.auth().currentUser?.uid || ''
                  vals.created = new Date().getTime()
                  vals.reviewed = new Date().getTime()
                  vals.nextReview = new Date().getTime() + 86400000
                  journeyRef.push(vals)
                  reset()
                })}
              >
                <TextField
                  label='Enter the title of your journey (what are you looking to remember?)'
                  name='title'
                  variant='outlined'
                  fullWidth
                  inputRef={register({
                    required: formErrorMessages.required
                  })}
                  error={!!errors.title}
                  helperText={errors.title?.message || ' '}
                />
                <TextField
                  label='What is the location of the mind palace for your journey?'
                  name='location'
                  variant='outlined'
                  fullWidth
                  inputRef={register({
                    required: formErrorMessages.required
                  })}
                  error={!!errors.location}
                  helperText={errors.location?.message || ' '}
                />
                <TextField
                  label='Is there a link to an image of the building or floorplan you would like to use?'
                  name='image'
                  variant='outlined'
                  fullWidth
                  inputRef={register({
                    required: false
                  })}
                  error={!!errors.location}
                  helperText={errors.location?.message || ' '}
                />
                <Button type='submit' color='primary'>
                  Submit
                </Button>
              </form>
            </AccordionDetails>
          </Accordion>
        </Paper>
        <p></p>

        <Paper>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownCircleIcon />}>
              Journeys Not Up for Review
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              {createJourneyCards(reviewedJourneyList)}
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Wrapper>
    </>
  )
}

export default Home
