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

function LinearProgressWithLabel(props: any) {
  return (
    <Box display='flex' alignItems='center'>
      <Box width='100%' mr={1}>
        <LinearProgress variant='determinate' color='secondary' {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant='body2' color='inherit'>
          <strong>{`${Math.round(props.value)}%`}</strong>
        </Typography>
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
      color: 'white',
      backgroundColor: '#47e398'
    },
    modal: {
      paddingLeft: '16px',
      paddingRight: '16px',
      maxWidth: '960px',
      margin: 'auto',
      paddingTop: theme.spacing(10)
    },
    modalContainer: {
      display: 'flex',
      alignItems: 'center'
    }
  }))

  const classes = useStyles()

  const emptyJourney = {
    id: '',
    userID: '',
    title: '',
    location: '',
    created: 0,
    reviewed: 0,
    nextReview: 0,
    image: ''
  }

  // let upcomingReviews = [{ start: new Date(), end: new Date(), title: '', journey: emptyJourney}]

  const [openEditModal, setOpenEditModal] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)
  const [openCalendarCardModal, setOpenCalendarCardModal] = useState(false)
  const [journeyToModal, setJourneyToModal] = useState(emptyJourney)
  const [journeyToEditID, setJourneyToEditID] = useState('')
  const [journeyToReviewID, setJourneyToReviewID] = useState('')
  const [upcomingReviews, setUpcomingReviews] = useState([
    { start: new Date(), end: new Date(), title: '', journey: emptyJourney }
  ])
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
            title: journeys[id].title as string,
            journey: { id, ...journeys[id] }
          })
          if (now > journeys[id].nextReview) {
            toReviewList.push({ id, ...journeys[id] })
          } else {
            reviewedList.push({ id, ...journeys[id] })
          }
        }
        setToReviewJourneyList(toReviewList)
        setReviewedJourneyList(reviewedList)
        setUpcomingReviews(nextReviews)
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

  const CURRENT_DATE = moment().toDate()

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
      <Wrapper>
        <Box className={classes.modalContainer}>
          <Modal
            open={openEditModal}
            onClose={() => {
              setOpenEditModal(false)
            }}
            className={classes.modal}
          >
            <EditForm editID={journeyToEditID} setModal={setOpenEditModal} />
          </Modal>
          <Modal
            open={openReviewModal}
            onClose={() => {
              setOpenReviewModal(false)
            }}
            className={classes.modal}
          >
            <Paper>
              <JourneyReview
                reviewID={journeyToReviewID}
                setModal={setOpenReviewModal}
                nextReview={journeyToReviewNextReview}
              />
            </Paper>
          </Modal>
          <Modal
            open={openCalendarCardModal}
            onClose={() => {
              setOpenCalendarCardModal(false)
            }}
            className={classes.modal}
          >
            <Paper>
              {journeyToModal != emptyJourney && (
                <Card className={classes.card}>
                  {/* {cardMedia()} */}
                  <CardContent>
                    <Typography color='textSecondary' gutterBottom>
                      {journeyToModal.location}
                    </Typography>
                    <Typography variant='h5' component='h2'>
                      {journeyToModal.title}
                    </Typography>
                    {/* <Typography color='textSecondary'>{journeyToModal.location}</Typography> */}
                    <Typography variant='body2' component='p'>
                      <br />
                      Reviewed:{' '}
                      {new Date(journeyToModal.reviewed).toLocaleString()}
                      <br />
                      Next Review:{' '}
                      {new Date(journeyToModal.nextReview).toLocaleString()}
                      <br />
                    </Typography>
                  </CardContent>
                  <CardActions disableSpacing>
                    <IconButton
                      aria-label='review'
                      onClick={() => {
                        setOpenReviewModal(true)
                        setJourneyToReviewID(journeyToModal.id)
                        const nextReview =
                          (journeyToModal.nextReview -
                            journeyToModal.reviewed) *
                          2
                        setJourneyToReviewNextReview(nextReview)
                      }}
                    >
                      <RateReviewIcon />
                    </IconButton>
                    <IconButton
                      aria-label='edit'
                      onClick={() => {
                        setOpenEditModal(true)
                        setJourneyToEditID(journeyToModal.id)
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label='delete'
                      className='rightButton'
                      onClick={() => {
                        handleJourneyDelete(journeyToModal.id)
                        setOpenCalendarCardModal(false)
                      }}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              )}
            </Paper>
          </Modal>
        </Box>

        <Typography paragraph>{currentUserString()}</Typography>
        <Paper>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownCircleIcon />}>
              <h3>Create Mind Palaces to Remember Like Never Before</h3>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography paragraph variant='h6'>
                    An ideal mind palace is a brightly lit deserted place with a
                    standard rout through it like a museum or school after hours
                    and is filled with striking images of people doing an action
                    to encode information with a key transition at every fifth
                    image
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography paragraph>
                    Key Vocabulary:
                    <br />
                    Image - The visual representation of what you are trying to
                    remember
                    <br />
                    Mind Palace - The visualization or a real or imaginary place
                    where you store images
                    <br />
                    Journey - The mental walk you take through the images you
                    have collected in the mind palace
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
        <Paper
          style={{
            padding: theme.spacing(1),
            marginBottom: theme.spacing(4),
            marginTop: theme.spacing(2),
            backgroundColor: '#6be8ac'
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={6}>
              {toReviewJourneyList[0] && (
                <Button
                  size='large'
                  variant='contained'
                  color='primary'
                  style={{ height: '100%', width: '100%', color: 'white' }}
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
              {!toReviewJourneyList[0] && (
                <Button disabled>
                  All Caught Up! No Journeys Up for Review
                </Button>
              )}
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>
                Up To Date: <strong>{reviewedJourneyList.length}</strong>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>
                For Review: <strong>{toReviewJourneyList.length}</strong>
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
        <Calendar
          popup
          selectable
          localizer={localizer}
          events={upcomingReviews}
          startAccessor='start'
          endAccessor='end'
          style={{ height: 500 }}
          eventPropGetter={(event, start, end, isSelected) => {
            let newStyle = {
              backgroundColor: '#47e398',
              color: 'white'
            }

            if (start > new Date()) {
              newStyle.backgroundColor = 'lightgrey'
            }

            return {
              // className: "",
              style: newStyle
            }
          }}
          onSelectEvent={event => {
            setJourneyToModal(event.journey)
            setOpenCalendarCardModal(true)
          }}
        />
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
        <br />
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
        <br />

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
        <Paper
          style={{
            padding: theme.spacing(1),
            marginBottom: theme.spacing(4),
            marginTop: theme.spacing(2),
            backgroundColor: '#6be8ac'
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                Total Journey Reviews:{' '}
                <strong>{reviewedJourneyList.length}</strong>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                Total Image Reviews:{' '}
                <strong>{toReviewJourneyList.length}</strong>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Wrapper>
    </>
  )
}

export default Home
