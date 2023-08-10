import express from "express";
import { exec } from "child_process";
import fs from "fs";
import { nanoid } from "nanoid";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const PORT = 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(cors());

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post("/compile", (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    // Generate unique filenames for the temporary files
    const codeFileName = path.join(__dirname, `temp_${nanoid()}.cpp`);
    const inputFileName = path.join(__dirname, `input_${nanoid()}.txt`);

    // Save the user's code to a temporary file
    fs.writeFile(codeFileName, code, (err) => {
        if (err) {
            console.error("Error saving code to temporary file:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }

        // Save the input to a temporary file
        fs.writeFile(inputFileName, input, (err) => {
            if (err) {
                console.error("Error saving input to temporary file:", err);
                // Clean up the code file if there's an error
                fs.unlink(codeFileName, () => { });
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            console.log("Input file saved:", inputFileName);

            // Compile the code using GCC
            exec(`g++  ${codeFileName} -o compiled_program`, (error, stdout, stderr) => {
                // Clean up the temporary files
                fs.unlink(codeFileName, () => { });

                if (error) {
                    console.error("Compilation error:", stderr);
                    res.status(500).json({ error: stderr });
                    fs.unlink(inputFileName, () => { });
                    return;
                }
                const compiledProgramPath = path.join(__dirname, "compiled_program");
                // Run the compiled program with input piping
                const childProcess = exec(`${compiledProgramPath} < ${inputFileName}`, (error, stdout, stderr) => {
                    // Clean up the compiled program
                    fs.unlink(inputFileName, () => { });
                    fs.unlink("compiled_program", () => { });
                    

                    if (error) {
                        console.error("Runtime error:", stderr);
                        res.status(500).json({ error: "Runtime error" });
                        return;
                    }

                    // Send the output back to the frontend
                    res.json({ output: stdout });
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
