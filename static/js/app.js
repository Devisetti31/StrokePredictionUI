const { createElement: h, useState } = React;

const initialForm = {
    gender: "Female",
    age: "55",
    hypertension: "0",
    heart_disease: "0",
    ever_married: "Yes",
    work_type: "Private",
    Residence_type: "Urban",
    avg_glucose_level: "160.5",
    bmi: "28.4",
    smoking_status: "never smoked"
};

function Icon({ name, size = 18 }) {
    const paths = {
        pulse: h("path", { d: "M3 12h4l2.2-6 4.1 12 2.1-6H21" }),
        shield: h("path", { d: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" }),
        heart: h("path", { d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" }),
        chevron: h("path", { d: "m7 10 5 5 5-5" }),
        check: h("path", { d: "m5 12 4 4L19 6" }),
        info: h("path", { d: "M12 16v-4m0-4h.01" })
    };
    const svgPaths = {
        lock: h(React.Fragment, null, h("rect", { x: 4, y: 10, width: 16, height: 11, rx: 2 }), h("path", { d: "M8 10V7a4 4 0 1 1 8 0v3" })),
        person: h(React.Fragment, null, h("circle", { cx: 12, cy: 8, r: 4 }), h("path", { d: "M5 21v-2a7 7 0 0 1 14 0v2" })),
        alert: h(React.Fragment, null, h("path", { d: "m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4-.1Z" }), h("path", { d: "M12 9v4m0 4h.01" })),
        info: h(React.Fragment, null, h("circle", { cx: 12, cy: 12, r: 10 }), h("path", { d: "M12 16v-4m0-4h.01" })),
        arrow: h(React.Fragment, null, h("path", { d: "M7 17 17 7M7 7h10v10" }))
    };
    const content = svgPaths[name] || paths[name] || paths.info;
    return h("svg", {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
    }, content);
}

function Field({ id, label, value, onChange, options, type = "text", min, max, step, hint }) {
    return h("div", { className: "field" },
        h("label", { htmlFor: id }, label),
        h("div", { className: "control-wrap" },
            options
                ? h(React.Fragment, null,
                    h("select", { id, name: id, value, onChange, required: true },
                        options.map((option) => h("option", { key: option.value, value: option.value }, option.label))
                    ),
                    h("span", { className: "select-chevron" }, h(Icon, { name: "chevron", size: 15 }))
                )
                : h("input", {
                    id,
                    name: id,
                    type: "number",
                    value,
                    onChange,
                    min,
                    max,
                    step,
                    required: true,
                    inputMode: "decimal"
                })
        ),
        hint && h("p", { className: "field-hint" }, hint)
    );
}

function App() {
    const [form, setForm] = useState(initialForm);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    function updateField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setResult(null);
    }

    async function submitForm(event) {
        event.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch("/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "The screening could not be completed. Please try again.");
            setResult({ prediction: data.prediction, text: data.result });
        } catch (error) {
            setResult({ error: error.message || "Unable to connect. Check your connection and try again." });
        } finally {
            setLoading(false);
        }
    }

    const outcomeClass = result?.error ? "error" : result ? (result.prediction === 1 ? "alert" : "success") : "";
    const outcomeIcon = result?.error ? "alert" : result ? (result.prediction === 1 ? "alert" : "check") : "info";
    const resultTitle = result?.error
        ? "Unable to complete screening"
        : result
            ? result.prediction === 1 ? "Stroke risk flagged" : "No stroke risk flagged"
            : "Your results, made clear";
    const resultDescription = result
        ? result.error
            ? "Please check the details and try the screening again."
            : result.prediction === 1
                ? "The model flagged this profile as potentially at risk. Please discuss the result with a healthcare professional."
                : "The model did not predict a stroke for the information provided. This result cannot rule out health concerns."
        : "Your screening summary will appear here when you're ready.";

    return h("div", { className: "shell" },
        h("header", { className: "topbar" },
            h("div", { className: "brand" },
                h("div", { className: "brand-mark" }, h(Icon, { name: "pulse", size: 21 })),
                h("div", { className: "brand-name" }, "pulse", h("span", null, "point"))
            ),
            h("div", { className: "topbar-right" },
                h("div", { className: "secure-label" }, h(Icon, { name: "lock", size: 15 }), h("span", null, "Private & secure")),
                h("div", { className: "avatar", "aria-label": "Guest profile" }, "GP")
            )
        ),
        h("main", { className: "main" },
            h("div", { className: "page-heading" },
                h("div", null,
                    h("p", { className: "eyebrow" }, "Preventive health"),
                    h("h1", null, "Stroke risk screening"),
                    h("p", { className: "subtitle" }, "A few details can help you understand your health picture. It takes less than a minute.")
                ),
                h("div", { className: "step-pill" },
                    h("span", { className: "step-dot" }),
                    h("strong", null, "Quick check"),
                    h("span", null, "·"),
                    h("span", null, "About 1 min")
                )
            ),
            h("div", { className: "layout" },
                h("section", { className: "form-column", "aria-labelledby": "profile-title" },
                    h("form", { className: "form-card", onSubmit: submitForm },
                        h("div", { className: "card-heading" },
                            h("div", null,
                                h("h2", { id: "profile-title" }, "Your health profile"),
                                h("p", null, "Share a few basics to get your screening result.")
                            ),
                            h("div", { className: "required-note" }, "All fields required")
                        ),
                        h("div", { className: "form-body" },
                            h("h3", { className: "section-title" },
                                h("span", { className: "section-icon" }, h(Icon, { name: "person", size: 15 })),
                                "About you"
                            ),
                            h("div", { className: "field-grid" },
                                h(Field, { id: "age", label: "Age", value: form.age, onChange: updateField, min: "0", max: "120", step: "1", hint: "Age in years" }),
                                h(Field, { id: "gender", label: "Gender", value: form.gender, onChange: updateField, options: [{ value: "Female", label: "Female" }, { value: "Male", label: "Male" }, { value: "Other", label: "Other" }] }),
                                h(Field, { id: "ever_married", label: "Ever married", value: form.ever_married, onChange: updateField, options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }] }),
                                h(Field, { id: "work_type", label: "Work type", value: form.work_type, onChange: updateField, options: [{ value: "Private", label: "Private" }, { value: "Self-employed", label: "Self-employed" }, { value: "Govt_job", label: "Government job" }, { value: "children", label: "Child / not applicable" }, { value: "Never_worked", label: "Never worked" }] }),
                                h(Field, { id: "Residence_type", label: "Residence", value: form.Residence_type, onChange: updateField, options: [{ value: "Urban", label: "Urban" }, { value: "Rural", label: "Rural" }] })
                            ),
                            h("h3", { className: "section-title" },
                                h("span", { className: "section-icon" }, h(Icon, { name: "heart", size: 15 })),
                                "Health indicators"
                            ),
                            h("div", { className: "field-grid" },
                                h(Field, { id: "hypertension", label: "High blood pressure", value: form.hypertension, onChange: updateField, options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }] }),
                                h(Field, { id: "heart_disease", label: "Heart disease", value: form.heart_disease, onChange: updateField, options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }] }),
                                h(Field, { id: "avg_glucose_level", label: "Average glucose level", value: form.avg_glucose_level, onChange: updateField, min: "0", max: "1000", step: "0.1", hint: "mg/dL" }),
                                h(Field, { id: "bmi", label: "Body mass index (BMI)", value: form.bmi, onChange: updateField, min: "0", max: "100", step: "0.1", hint: "Your most recent BMI" }),
                                h(Field, { id: "smoking_status", label: "Smoking status", value: form.smoking_status, onChange: updateField, options: [{ value: "never smoked", label: "Never smoked" }, { value: "formerly smoked", label: "Formerly smoked" }, { value: "smokes", label: "Currently smokes" }, { value: "Unknown", label: "Prefer not to say / unknown" }] })
                            ),
                            h("div", { className: "form-footer" },
                                h("div", { className: "privacy-note" }, h(Icon, { name: "lock", size: 14 }), "Your information is used for this screening only."),
                                h("button", { className: "submit-button", type: "submit", disabled: loading },
                                    loading ? h("span", { className: "spinner", "aria-hidden": "true" }) : h(Icon, { name: "pulse", size: 17 }),
                                    loading ? "Checking..." : "View my screening",
                                    !loading && h(Icon, { name: "arrow", size: 15 })
                                )
                            )
                        )
                    )
                ),
                h("aside", { className: "side-column", "aria-label": "Screening information" },
                    h("section", { className: `result-card ${result ? `has-result ${outcomeClass}` : ""}`, "aria-live": "polite" },
                        h("div", { className: "result-top" },
                            h("div", { className: "result-kicker" }, h("span", { className: "live-dot" }), result ? "SCREENING RESULT" : "YOUR SCREENING"),
                            h("div", { className: "result-icon" }, h(Icon, { name: result ? outcomeIcon : "pulse", size: 22 })),
                            h("h2", { className: "result-title" }, result ? resultTitle : "Your results, made clear"),
                            h("p", { className: "result-copy" }, resultDescription)
                        ),
                        h("div", { className: "result-body" },
                            result && !result.error
                                ? h("div", { className: `prediction-output ${outcomeClass}` },
                                    h("span", { className: "output-label" }, "MODEL PREDICTION"),
                                    h("h3", { className: "output-text" }, result.text),
                                    h("p", { className: "output-note" }, result.prediction === 1
                                        ? "Please contact a healthcare professional for a proper assessment."
                                        : "A model result is not a diagnosis and cannot rule out a stroke.")
                                )
                                : h("div", { className: `result-message ${outcomeClass}` },
                                    h("span", { className: "result-message-icon" }, h(Icon, { name: outcomeIcon, size: 16 })),
                                    h("p", null, result?.error || "Complete the health profile and run a screening to see the model's result here.")
                                ),
                            h("p", { className: "result-footnote" }, "This is an automated screening estimate, not a diagnosis. Always talk with a qualified healthcare professional about your health.")
                        )
                    ),
                    h("section", { className: "info-card" },
                        h("div", { className: "info-heading" }, h(Icon, { name: "shield", size: 17 }), "A thoughtful first step"),
                        h("p", null, "This tool looks at common health indicators to support awareness. Your answers are sent securely to the screening service and aren't saved by this page."),
                        h("div", { className: "trust-row" },
                            h("span", { className: "trust-badge" }, h(Icon, { name: "lock", size: 15 })),
                            h("span", null, "Private by design", h("br"), "No account needed")
                        )
                    )
                )
            ),
            h("footer", { className: "page-footer" },
                h("span", null, h("strong", null, "Please note:"), " This tool is for educational purposes and is not a substitute for professional medical advice."),
                h("span", null, "If you think someone is having a stroke, contact emergency services immediately.")
            )
        )
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
