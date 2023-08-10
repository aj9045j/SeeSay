import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { sublime } from '@uiw/codemirror-theme-sublime'
import { githubDark } from '@uiw/codemirror-theme-github';

const OutputModal = ({ output, onClose }) => {
    return (
        <div className="output-box" style={{ display: output ? 'block' : 'none' }}>
            <div className="output-content">
                <span className="close" onClick={onClose}>&times;</span>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default function CodeEditor() {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');

    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const onChange = React.useCallback((value, viewUpdate) => {
        setCode(value);
    }, []);
    const changeInput = React.useCallback((value, viewUpdate) => {
        setInput(value);
    }, []);

    const handleCompile = () => {
        const data = {
            code: code,
            input: input
        };

        fetch('https://compiler-27z4.onrender.com', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setOutput(`Error: ${data.error}`);
                } else {
                    setOutput(`Output:\n${data.output}`);
                }
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
            });
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleCloseModal = () => {
        setOutput('');
    };

    return (
        <div className="container">
            <div className="code-mirror-container">
                <CodeMirror
                    className="codemirror"
                    value={code}
                    mode="text/x-c++src"
                    extensions={[cpp()]}
                    theme={githubDark}
                    onChange={onChange}
                    height={`${windowDimensions.height - 228}px`}
                    width={`${windowDimensions.width / 1.7}px`}
                />
                <h1>INPUT</h1>
                <CodeMirror
                    className='codemirror_input'
                    value={input}
                    theme={sublime}
                    height='200px'
                    width={`${windowDimensions.width / 1.7}px`}
                    onChange={changeInput}
                />
            </div>
            <div className="button-container">
                <button className="compile-button" onClick={handleCompile}>
                    Compile
                </button>
            </div>
            <OutputModal output={output} onClose={handleCloseModal} />




        </div >
    );
}
