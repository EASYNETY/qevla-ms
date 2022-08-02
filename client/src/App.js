import React, { Component } from "react";
import {
  Grid,
  Typography,
  Button,
  withStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import PropTypes from "prop-types";
import io from "socket.io-client";
import axios from "axios";
import URLs from "./URLs";
import styles from "./styles";
import ThoughtList from "./components/ThoughtList";

class App extends Component {
  state = {
    showAddDialog: false,
    addresses: [],
    name: "",
    description: "",
    nameError: false,
    descriptionError: false,
    nameErrorMsg: "",
    descriptionErrorMsg: "",
  };

  componentDidMount = async () => {
    //socket.io connection
    const socket = io(`${URLs.socketURL}/socket`);

    socket.on("newAddress", (address) => {
      this.setState({ addresses: [...this.state.addresses, address] });
    });

    socket.on("deletedAddress", (id) => {
      const updatedThoughts = this.state.addresses.filter((address) => {
        return address._id !== id;
      });

      this.setState({ addresses: updatedThoughts });
    });

    socket.on("addressesCleared", () => {
      this.setState({ addresses: [] });
    });

    await this.fetchThoughts();
  };

  fetchThoughts = async () => {
    try {
      const response = await axios.get(`${URLs.baseURL}/address/getThoughts`);
      if (response.data.success) {
        console.log(response.data.message);
        this.setState({ addresses: response.data.message });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log("Error with fetching addresses: ", error);
      alert(
        "Error with fetching address. Please check the console for more info."
      );
    }
  };

  toggleAddDialog = () => {
    this.setState({ showAddDialog: !this.state.showAddDialog }, () => {
      //if form closed, clear the text fields
      if (!this.state.showAddDialog) {
        this.setState({ name: "", description: "" });
      }
    });
  };

  handleChange = (event) => {
    let value = event.target.value;
    let property = event.target.name;

    switch (property) {
      case "name":
        if (value.length > 20) {
          value = value.substr(0, 20);
        }
        this.setState({ [property]: value });
        break;

      case "description":
        if (value.length > 100) {
          value = value.substr(0, 100);
        }
        this.setState({ [property]: value });
        break;

      default:
        break;
    }
  };

  handleInputValidation = () => {
    let valid = true;

    const inputs = [
      {
        name: "name",
        whitespaceMsg: "*Please enter a name.",
      },
      {
        name: "description",
        whitespaceMsg: "*Please enter description.",
      },
    ];

    for (let input of inputs) {
      const value = this.state[input.name];

      if (!value.replace(/\s/g, "").length) {
        this.setState({
          [input.name + "ErrorMsg"]: input.whitespaceMsg,
          [input.name + "Error"]: true,
        });
        valid = false;
        continue;
      } else {
        this.setState({
          [input.name + "ErrorMsg"]: "",
          [input.name + "Error"]: false,
        });
      }
    }

    return valid;
  };

  addThought = async () => {
    if (this.handleInputValidation()) {
      try {
        const response = await axios.post(
          `${URLs.baseURL}/address/addThought`,
          {
            name: this.state.name,
            description: this.state.description,
          }
        );

        if (response.data.success) {
          this.toggleAddDialog();
          alert(response.data.message);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.log("Error with adding address: ", error);
        alert(
          "Error with adding address. Please check the console for more info."
        );
      }
    }
  };

  render() {
    const classes = this.props.classes;

    return (
      <React.Fragment>
        {/*add item dialog*/}
        <Dialog open={this.state.showAddDialog} onClose={this.toggleAddDialog}>
          <DialogTitle>
            <span style={{ fontWeight: "bold" }}>Add a Thought</span>
          </DialogTitle>
          <DialogContent>
            <Grid
              container
              justify="flex-start"
              alignItems="flex-start"
              spacing={2}
            >
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Name"
                  size="small"
                  name="name"
                  value={this.state.name}
                  onChange={this.handleChange}
                  error={this.state.nameError}
                  helperText={this.state.nameErrorMsg}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  variant="outlined"
                  label="Description"
                  size="small"
                  name="description"
                  value={this.state.description}
                  onChange={this.handleChange}
                  error={this.state.descriptionError}
                  helperText={this.state.descriptionErrorMsg}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              onClick={this.toggleAddDialog}
              className={classes.redButton}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={this.addThought}
              className={classes.greenButton}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        {/*top bar*/}
        <Grid
          container
          spacing={2}
          direction="row"
          justify="space-between"
          alignItems="center"
          style={{
            backgroundColor: "#E94057",
          }}
        >
          <Grid item>
            <Typography variant="h3" className={classes.name}>
              Thought Wall
            </Typography>
          </Grid>
          <Grid item>
            <Button
              size="small"
              variant="contained"
              className={classes.button}
              onClick={this.toggleAddDialog}
            >
              Add Thought
            </Button>
          </Grid>
        </Grid>
        {/*address cards*/}
        <br />
        <Grid
          container
          spacing={2}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <ThoughtList addresses={this.state.addresses} />
        </Grid>
      </React.Fragment>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
