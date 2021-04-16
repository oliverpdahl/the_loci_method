import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import grey from '@material-ui/core/colors/grey'
import teal from '@material-ui/core/colors/teal'

// https://material-ui.com/customization/themes/#themes

const theme = createMuiTheme({
  palette: {
    primary: { dark: '#319e6a', main: '#47e398', light: '#6be8ac' },
    secondary: { main: '#707e73', dark: '#4e5850', light: '#8c978f' }
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: grey[50]
      }
    }
  }
})

export default theme
