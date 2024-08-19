import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Container,
  SelectChangeEvent,
} from "@mui/material";

interface FormComponentProps {
  setData: (data: any) => void;
  disabled: boolean;
}

const asc = (arr: number[]) => arr.sort((a, b) => a - b);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const mean = (arr: number[]) => sum(arr) / arr.length;

// sample standard deviation
const std = (arr: number[]) => {
  const mu = mean(arr);
  const diffArr = arr.map((a) => (a - mu) ** 2);
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr: number[], q: number) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

const scaleValue = (x: number, min: number, max: number) => {
  return 1 - (x - min) / (max - min);
};

const FormComponent: React.FC<FormComponentProps> = ({ setData, disabled }) => {
  const ageLowerLimit = 27.5;
  const ageUpperLimit = 79.5;
  const restingBPLowerLimit = 90;
  const restingBPUpperLimit = 170;
  const cholesterolLowerLimit = 32.625;
  const cholesterolUpperLimit = 407.625;
  const fastingBSLowerLimit = 0;
  const fastingBSUpperLimit = 0;
  const maxHRLowerLimit = 66;
  const maxHRUpperLimit = 210;
  const oldpeakLowerLimit = -2.25;
  const oldpeakUpperLimit = 3.75;

  const initialState: { [key: string]: string | number } = {
    my_input_0: 40,
    my_input_1: 1,
    my_input_2: 0,
    my_input_3: 117,
    my_input_4: 155,
    my_input_5: 0,
    my_input_6: 0,
    my_input_7: 150,
    my_input_8: 0,
    my_input_9: 1,
    my_input_10: 1 / 2,
  };

  const [formData, setFormData] = useState<{ [key: string]: string | number }>(
    initialState
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert string values to numbers where appropriate
    const parsedFormData = { ...formData };
    parsedFormData["my_input_0"] = scaleValue(
      +parsedFormData["my_input_0"],
      ageLowerLimit,
      ageUpperLimit
    );
    parsedFormData["my_input_3"] = scaleValue(
      +parsedFormData["my_input_3"],
      restingBPLowerLimit,
      restingBPUpperLimit
    );
    parsedFormData["my_input_4"] = scaleValue(
      +parsedFormData["my_input_4"],
      cholesterolLowerLimit,
      cholesterolUpperLimit
    );
    parsedFormData["my_input_5"] = 0;
    parsedFormData["my_input_7"] = scaleValue(
      +parsedFormData["my_input_7"],
      maxHRLowerLimit,
      maxHRUpperLimit
    );
    parsedFormData["my_input_9"] = scaleValue(
      +parsedFormData["my_input_9"],
      oldpeakLowerLimit,
      oldpeakUpperLimit
    );

    console.log(parsedFormData);

    setData(parsedFormData);
  };

  return (
    <Container style={{ width: "100%", display: "flex", alignItems: "start" }}>
      <form onSubmit={handleSubmit}>
        <div>
          <TextField
            disabled={disabled}
            type="string"
            id="my_input_0"
            name="my_input_0"
            label="Age"
            value={formData["my_input_0"]}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id={`my_input_1-label`}>Sex</InputLabel>
            <Select
              disabled={disabled}
              label="Sex"
              labelId={`my_input_1-label`}
              id="my_input_1"
              name="my_input_1"
              value={formData["my_input_1"]}
              onChange={handleSelectChange}
            >
              <MenuItem value={0}>Male</MenuItem>
              <MenuItem value={1}>Female</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id={`my_input_2-label`}>Type of Chest Pain</InputLabel>
            <Select
              disabled={disabled}
              label="Type of Chest Pain"
              labelId={`my_input_2-label`}
              id="my_input_2"
              name="my_input_2"
              value={formData["my_input_2"]}
              onChange={handleSelectChange}
            >
              <MenuItem value={0}>ASY</MenuItem>
              <MenuItem value={1 / 3}>ATA</MenuItem>
              <MenuItem value={2 / 3}>NAP</MenuItem>
              <MenuItem value={1}>TA</MenuItem>
            </Select>
          </FormControl>
          <TextField
            disabled={disabled}
            type="string"
            id="my_input_3"
            name="my_input_3"
            label="Resting BP"
            value={formData["my_input_3"]}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <TextField
            disabled={disabled}
            type="string"
            id="my_input_4"
            name="my_input_4"
            label="Cholesterol"
            value={formData["my_input_4"]}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id={`my_input_5-label`}>Fasting BS</InputLabel>
            <Select
              disabled={disabled}
              label="Fasting BS"
              labelId={`my_input_5-label`}
              id="my_input_5"
              name="my_input_5"
              value={formData["my_input_5"]}
              onChange={handleSelectChange}
            >
              <MenuItem value={0}>Yes</MenuItem>
              <MenuItem value={1}>No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id={`my_input_6-label`}>Resting ECG</InputLabel>
            <Select
              disabled={disabled}
              label="Resting ECG"
              labelId={`my_input_6-label`}
              id="my_input_6"
              name="my_input_6"
              value={formData["my_input_6"]}
              onChange={handleSelectChange}
            >
              <MenuItem value={1}>Normal</MenuItem>
              <MenuItem value={0.5}>ST</MenuItem>
              <MenuItem value={0}>LVH</MenuItem>
            </Select>
          </FormControl>
          <TextField
            disabled={disabled}
            type="string"
            id="my_input_7"
            name="my_input_7"
            label="Max HR"
            value={formData["my_input_7"]}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id={`my_input_8-label`}>Exercise Angina</InputLabel>
            <Select
              disabled={disabled}
              label="Exercise Angina"
              labelId={`my_input_8-label`}
              id="my_input_8"
              name="my_input_8"
              value={formData["my_input_8"]}
              onChange={handleSelectChange}
            >
              <MenuItem value={0}>Yes</MenuItem>
              <MenuItem value={1}>No</MenuItem>
            </Select>
          </FormControl>
          <TextField
            disabled={disabled}
            type="string"
            id="my_input_9"
            name="my_input_9"
            label="Oldpeak"
            value={formData["my_input_9"]}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id={`my_input_10-label`}>ST Slope</InputLabel>
            <Select
              disabled={disabled}
              label="ST Slope"
              labelId={`my_input_10-label`}
              id="my_input_10"
              name="my_input_10"
              value={formData["my_input_10"]}
              onChange={handleSelectChange}
            >
              <MenuItem value={0}>Up</MenuItem>
              <MenuItem value={0.5}>Flat</MenuItem>
              <MenuItem value={1}>Top</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button type="submit" disabled={disabled} variant="contained" color="primary">
          Submit Your Data
        </Button>
      </form>
    </Container>
  );
};

export default FormComponent;
