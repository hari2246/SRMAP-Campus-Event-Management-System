import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from "@mui/material";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

const VenueForm = () => {
  const [formData, setFormData] = useState({
    venueName: "",
    location: "",
    capacity: "",
    status: "available",
    description: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    buildingName: ""
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        capacity: parseInt(formData.capacity),
        lastUpdated: serverTimestamp()
      };
      await addDoc(collection(db, "venues"), dataToSubmit);
      alert("Venue added successfully!");
      setSubmittedData(formData);
      setFormData({
        venueName: "",
        location: "",
        capacity: "",
        status: "available",
        description: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        buildingName: ""
      });
      fetchVenues(); // Refresh list
    } catch (error) {
      console.error("Error adding venue:", error);
      alert("Failed to add venue.");
    }
  };

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "venues"));
      const venuesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setVenues(venuesData);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const formFields = [
    ["venueName", "Venue Name"],
    ["location", "Location"],
    ["capacity", "Capacity"],
    ["description", "Description"],
    ["contactPerson", "Contact Person"],
    ["contactEmail", "Contact Email"],
    ["contactPhone", "Contact Phone"],
    ["buildingName", "Building Name"]
  ];

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Form Section */}
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 800 }}>
        <Typography variant="h4" textAlign="center" color="primary" gutterBottom>
          Add New Venue
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {formFields.map(([key, label]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={label}
                  name={key}
                  type={key === "capacity" ? "number" : "text"}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="booked">Booked</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" size="large">
                Add Venue
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Submitted Confirmation */}
      {submittedData && (
        <Paper elevation={2} sx={{ p: 4, width: '100%', maxWidth: 800 }}>
          <Typography variant="h5" color="success.main" textAlign="center" gutterBottom>
            Venue Added Successfully 🎉
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(submittedData).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Typography variant="body1">
                  <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Venue List Section */}
      <Paper elevation={2} sx={{ p: 4, width: '100%', maxWidth: 800 }}>
        <Typography variant="h5" color="text.primary" textAlign="center" gutterBottom>
          Existing Venues
        </Typography>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : venues.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            No venues added yet.
          </Typography>
        ) : (
          <List>
            {venues.map((venue) => (
              <React.Fragment key={venue.id}>
                <ListItem>
                  <ListItemText
                    primary={venue.venueName}
                    secondary={`Location: ${venue.location} | Capacity: ${venue.capacity} | Status: ${venue.status}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default VenueForm;
