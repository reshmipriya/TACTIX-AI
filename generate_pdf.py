"""
TACTIX AI - Comprehensive PDF Documentation Generator
Generates a detailed, beautifully styled technical & workflow PDF guide in simple language.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "TACTIX AI — Complete Platform Architecture & Workflow Guide")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.drawString(54, 32, "Confidential & Proprietary — Decision-Support Prototype (Fictional / Simulation Only)")
        self.restoreState()

def build_pdf(filename="TACTIX_AI_Comprehensive_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Palette
    c_primary = colors.HexColor("#0F172A")    # Deep Slate
    c_accent = colors.HexColor("#0D9488")     # Teal / Tactical Green
    c_blue = colors.HexColor("#2563EB")       # Blue
    c_amber = colors.HexColor("#D97706")      # Amber
    c_dark = colors.HexColor("#1E293B")       # Dark Text
    c_muted = colors.HexColor("#475569")      # Muted Text
    c_bg_box = colors.HexColor("#F1F5F9")     # Light Box Bg
    c_border = colors.HexColor("#CBD5E1")     # Border

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_primary,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_accent,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_accent,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=c_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_dark,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # ---------------------------------------------------------
    # COVER / HEADER
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("TACTIX AI", title_style))
    story.append(Paragraph("AI-Assisted Simulated Mission-Planning & Risk Analysis Platform<br/><font color='#64748B' size='10'>Comprehensive Technical Architecture, Routing Algorithms, Datasets, and Workflow Guide</font>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_accent, spaceBefore=2, spaceAfter=12))

    # Executive Overview Box
    overview_text = """<b>Executive Summary:</b> TACTIX AI is a web-based decision-support platform designed to demonstrate how real environmental data (satellite terrain elevation, road infrastructure, satellite land-cover, and hourly weather reanalysis), synthetic operational data (logistics capacity, sensor uncertainty), deterministic mathematical simulation (A* multi-objective pathfinding and a 6-factor risk engine), and large language models (LLMs) combine into a single, explainable tool. It is built strictly as a controlled simulation prototype for fictional training scenarios."""
    overview_table = Table([[Paragraph(overview_text, callout_style)]], colWidths=[504])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_box),
        ('BOX', (0, 0), (-1, -1), 1, c_accent),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 12))

    # ---------------------------------------------------------
    # SECTION 1: CORE CONCEPTS USED
    # ---------------------------------------------------------
    story.append(Paragraph("1. Core Concepts & Principles Used in TACTIX AI", h1_style))
    story.append(Paragraph("To understand how TACTIX AI operates, it helps to understand its core design pillars:", body_style))
    
    story.append(Paragraph("• <b>Explainability Over Black-Box AI:</b> Traditional AI route planners often use deep neural networks that output a path without explaining <i>why</i> that path was chosen. TACTIX AI uses a transparent, auditable weighted mathematical formula where every single point of risk can be traced directly to physical slope, soil moisture, weather friction, or fuel draw.", bullet_style))
    story.append(Paragraph("• <b>Deterministic Core, Optional AI Shell:</b> The pathfinder, physics simulation, constraint checker, and risk score engine are written in 100% pure TypeScript algorithms that run client-side. If the internet is disconnected or OpenAI goes down, the entire simulation engine continues to work perfectly.", bullet_style))
    story.append(Paragraph("• <b>Human-in-the-Loop Decision Support:</b> The AI acts as an advisor/analyst that translates words into simulation parameters and explains trade-offs. The AI <b>never</b> invents numerical risk scores, never overrides human judgment, and never picks a 'best military plan'—it presents evaluated alternatives for human evaluation.", bullet_style))
    story.append(Paragraph("• <b>Progressive Disclosure (Simple View vs Advanced View):</b> Designed for both beginners and deep technical analysts. By default, the interface presents simple, clean option cards with plain English explanations and <code>[ Why? ]</code> buttons. With one click, power users can expand full raw GIS telemetry.", bullet_style))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 2: TECH STACK & LANGUAGES USED
    # ---------------------------------------------------------
    story.append(Paragraph("2. Technologies & Programming Languages Used", h1_style))
    story.append(Paragraph("The platform is architected across four clean layers using modern, production-grade tools:", body_style))

    tech_data = [
        ["Layer", "Technologies / Libraries", "Role in TACTIX AI"],
        ["Frontend (UI)", "Next.js 15 (App Router)\nReact 19\nTypeScript\nTailwind CSS", "Provides responsive layout, Tactical Ops command-center theme, interactive sliders, guided tours, and dual Simple/Advanced views."],
        ["Mapping & Charts", "MapLibre GL JS\nHTML5 Canvas\nRecharts\nLucide Icons", "Renders 10 toggleable map layers (terrain, roads, water, weather, routes) with click-to-inspect cell telemetry and multi-dimensional radar charts."],
        ["Simulation Engine\n(Backend Core)", "Pure TypeScript\n(zero external runtime\ndependencies)", "Executes A* multi-objective pathfinding, environment cost evaluation, duration/fuel physics simulation, and 6-factor risk scoring in under 5 milliseconds."],
        ["AI & API Layer", "Next.js Serverless Routes\nOpenAI GPT-4.1-mini\nZod Schema Validator", "<code>/api/interpret</code> translates natural language into structured parameters. <code>/api/analyze</code> synthesizes trade-off explanations grounded in computed numbers."],
        ["GIS Data Pipeline\n& ML Experiment", "Python 3.11\nNumPy, Rasterio, Shapely\nGeoPandas, Scikit-learn", "Offline GIS data clipping and raster processing. Trains Random Forest Regressor (300 trees, R² = 0.9989) on 3,000 synthetic perturbation samples."]
    ]
    tech_table = Table(tech_data, colWidths=[100, 150, 254])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('LEADING', (0, 0), (-1, -1), 11.5),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_box]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # ---------------------------------------------------------
    # SECTION 3: BACKEND DATASETS EXPLAINED SIMPLY
    # ---------------------------------------------------------
    story.append(Paragraph("3. Backend Datasets & How They Are Processed", h1_style))
    story.append(Paragraph("TACTIX AI fuses four real public environmental datasets with two synthetic operational feeds. All data is clipped to a shared 42.8 km² study area (Chennai Coastal & River Corridor, 12.95°N–13.01°N, 80.13°E–80.20°E):", body_style))

    datasets_data = [
        ["Dataset", "Source & Type", "Variables Extracted", "How It Affects Routing & Risk"],
        ["1. SRTM DEM\n(Terrain)", "USGS / NASA\n(Real 30m Global DEM)", "Elevation, Slope (deg),\nAspect, Roughness (std-dev)", "Steep slopes and rocky roughness slow vehicle transit and increase terrain risk (0–100 score)."],
        ["2. OpenStreetMap\n(Infrastructure)", "OSM Community\n(Real Vector Layers)", "Roads, Waterways,\nBridges, Buildings", "Cells near paved roads get high accessibility bonuses (+speed, -fuel). Water channels block movement unless bridged."],
        ["3. Copernicus\n(Land Cover)", "European Union\n(Real Satellite Map)", "Urban (0.5), Forest (0.7),\nGrassland (0.3), Water (1.0),\nWetland (0.8), Bare (0.35)", "Each land type has a friction multiplier. Open fields (0.3) are fast; marshlands (0.8) and water (1.0) severely impede vehicles."],
        ["4. ERA5 Weather", "ECMWF\n(Real Reanalysis)", "Rain (mm), Wind (m/s),\nPressure (hPa), Visibility", "Classifies weather into 5 tiers (Normal: 10 to Severe Storm: 90). Rain creates surface slickness and slows speeds."],
        ["5. Synthetic\nLogistics", "In-House Synthetic\n(Simulation Only)", "Personnel, Resource Level,\nReadiness, Time Limit", "Models fuel capacity and vehicle readiness. Lower fuel levels create higher logistics stress."],
        ["6. Synthetic\nIntelligence", "In-House Synthetic\n(Simulation Only)", "Observation Type, Zone,\nConfidence, Reliability", "Calculates information uncertainty = 1 - (confidence × reliability). Higher uncertainty raises risk."]
    ]
    ds_table = Table(datasets_data, colWidths=[90, 100, 130, 184])
    ds_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('LEADING', (0, 0), (-1, -1), 10.5),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_box]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(ds_table)

    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 4: HOW THE ROUTING MODEL WORKS (IN-DEPTH)
    # ---------------------------------------------------------
    story.append(Paragraph("4. How the Model Arrives at the Shortest & Most Appropriate Route", h1_style))
    story.append(Paragraph("One of the most important technical achievements of TACTIX AI is its multi-objective routing algorithm. Here is the step-by-step breakdown of how a route is discovered and selected:", body_style))

    story.append(Paragraph("Step A: Creating the Unified Environment Grid", h2_style))
    story.append(Paragraph("The map area is divided into a regular grid of <b>30 rows × 35 columns = 1,050 cells</b>. Every individual cell carries precomputed environmental values. For any cell <i>c</i>, the platform computes its <b>Single-Cell Environment Cost (0 to 100)</b>:", body_style))
    
    formula_box = """<b>Environment Cost Formula:</b><br/>
    Cost(cell) = [ 0.35 × TerrainScore ] + [ 0.25 × LandCoverFactor × 100 ] + [ 0.25 × WeatherImpact ] + [ 0.15 × (1 - RoadAccessibility) × 100 ]<br/>
    <i>• Terrain: 35% weight | Land Cover: 25% weight | Weather: 25% weight | Road Access: 15% weight (Sums to 100%).</i>"""
    formula_table = Table([[Paragraph(formula_box, callout_style)]], colWidths=[504])
    formula_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ('BOX', (0, 0), (-1, -1), 1, c_accent),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(formula_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Step B: Building the 8-Connected Planning Graph", h2_style))
    story.append(Paragraph("Each cell in the grid represents a <b>Node</b>. Each node connects to its 8 surrounding neighbor cells (North, South, East, West, and 4 Diagonals). A step between cell A and cell B represents an <b>Edge</b>. If a neighbor is deep water without a bridge, that connection is pruned.", body_style))

    story.append(Paragraph("Step C: The A* Search Algorithm in Action", h2_style))
    story.append(Paragraph("To find a route from Start to Goal, TACTIX AI executes the <b>A* (A-Star) Pathfinding Algorithm</b>:", body_style))
    story.append(Paragraph("1. <b>gScore(n):</b> The exact accumulated cost traveled from the Start cell to the current cell <i>n</i>.", bullet_style))
    story.append(Paragraph("2. <b>hScore(n) [Heuristic]:</b> The estimated Great-Circle (Haversine) physical distance remaining from cell <i>n</i> to the Goal cell. Because the heuristic never overestimates physical distance, A* is mathematically guaranteed to find the optimal path.", bullet_style))
    story.append(Paragraph("3. <b>fScore(n) = gScore(n) + hScore(n):</b> The total estimated path cost through cell <i>n</i>.", bullet_style))
    story.append(Paragraph("4. <b>MinHeap Priority Queue:</b> At each step, the algorithm pops the cell with the lowest <code>fScore</code> from a binary MinHeap, explores its 8 neighbors, updates their tentative scores, and repeats until the Goal cell is reached.", bullet_style))

    story.append(Spacer(1, 6))

    story.append(Paragraph("Step D: Why Three Distinct Simulated Options (COAs) Are Generated", h2_style))
    story.append(Paragraph("Instead of presenting only one route, TACTIX AI generates <b>three genuinely distinct Courses of Action (COAs)</b> by varying the edge-cost objective function over the exact same graph:", body_style))

    coa_data = [
        ["Option Name", "Optimization Objective", "Mathematical Edge-Cost Formula", "Behavioral Strategy"],
        ["⚡ Option Alpha\n(Speed Priority)", "Minimize simulated duration", "Cost(a, b) = Distance(a, b) × 1.0 + [ EnvCost(b) / 100 ] × 0.2\n(Roads receive a 40% speed bonus)", "Pushes along major highway corridors to achieve the shortest transit time, even if terrain friction is higher."],
        ["📦 Option Bravo\n(Resource-Opt)", "Minimize fuel burn & vehicle wear", "Cost(a, b) = ResourceBurn(a, b) × 1.0 + [ EnvCost(b) / 100 ] × 0.4\n(Where ResourceBurn penalizes uphill climbs)", "Steers onto paved, level grades with steady speeds to preserve fuel and minimize mechanical wear."],
        ["🌿 Option Charlie\n(Hazard Bypass)", "Minimize environmental hazard", "Cost(a, b) = [ EnvCost(b) / 100 ] × 1.0 + Distance(a, b) × 0.3\n(Water proximity heavily penalized 3.0×)", "Avoids steep slopes, muddy basins, and riverbanks completely, taking a wider but much safer detour."]
    ]
    coa_table = Table(coa_data, colWidths=[85, 105, 174, 140])
    coa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('LEADING', (0, 0), (-1, -1), 10.5),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_box]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(coa_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Step E: Constraint Engine & Rule Validation", h2_style))
    story.append(Paragraph("Once routes are generated, each route passes through the <b>Constraint Engine</b>:", body_style))
    story.append(Paragraph("• <b>Time Limit:</b> If Route Duration > Scenario Time Limit → Classified as <b>INVALID (✕)</b>.", bullet_style))
    story.append(Paragraph("• <b>Resource Limit:</b> If Fuel Burn > Available Resource Envelope → Classified as <b>INVALID (✕)</b> (or <b>WARNING (⚠)</b> if within 10%).", bullet_style))
    story.append(Paragraph("• <b>Restricted Zones:</b> Ray-casting polygon intersection detects if any route segment enters an ecological sanctuary or hazard corridor → Classified as <b>INVALID (✕)</b>.", bullet_style))
    story.append(Paragraph("• <b>Preferred Alternative Selection:</b> The system highlights the lowest-risk <b>VALID</b> option as the <i>'Preferred Simulated Alternative'</i> (never labeled as 'best military plan').", bullet_style))

    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 5: RISK ENGINE & AI ARCHITECTURE
    # ---------------------------------------------------------
    story.append(Paragraph("5. The Explainable Risk Engine & AI Architecture", h1_style))
    
    story.append(Paragraph("The 6-Factor Weighted Risk Formula (0 to 100)", h2_style))
    story.append(Paragraph("Every Course of Action receives an explainable risk score computed from 6 documented factors:", body_style))

    risk_data = [
        ["Factor", "Weight", "What Drives This Factor?", "Formula / Range"],
        ["Terrain Risk", "22% (0.22)", "Mean slope gradient and elevation roughness along the route.", "avg(TerrainScore) on scale 0–100"],
        ["Weather Risk", "22% (0.22)", "Precipitation intensity, storm gusts, and visibility class.", "Weather.impact_score on scale 0–100"],
        ["Logistics Stress", "20% (0.20)", "Fuel availability, equipment readiness, supply depletion.", "100 - (ResourceLevel × Readiness × 100)"],
        ["Intel Uncertainty", "18% (0.18)", "Reliability and sensor gaps in nearby synthetic intelligence.", "avg(Uncertainty) of reports within 2.2 km buffer"],
        ["Time Pressure", "10% (0.10)", "Proximity of estimated transit duration to the hard deadline.", "clamp01(Duration / TimeLimit - 0.4) × 166.7"],
        ["Constraint Stress", "8% (0.08)", "Warnings (18 pts each) and hard rule violations (45 pts each).", "Warnings × 18 + Violations × 45 (capped at 100)"]
    ]
    risk_table = Table(risk_data, colWidths=[90, 65, 200, 149])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('LEADING', (0, 0), (-1, -1), 10.5),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_box]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("How the AI Works (Interpreter & Analyst)", h2_style))
    story.append(Paragraph("The platform integrates two specialized AI modules via serverless API routes:", body_style))
    story.append(Paragraph("1. <b>AI Mission Interpreter (<code>POST /api/interpret</code>):</b> Takes free-text user orders (e.g. <i>'Move through north sector under monsoon rain within 5 hours'</i>) and converts them into structured JSON: <code>{ weather: 'HEAVY_RAIN', resource_level: 0.55, time_limit: 5, terrain_preference: 'AVOID_WATER' }</code>. The output is strictly validated against a Zod schema before touching the simulator.", bullet_style))
    story.append(Paragraph("2. <b>AI Decision Analyst (<code>POST /api/analyze</code>):</b> Takes the pre-computed metrics and risk tables and generates plain-language executive summaries, trade-off comparisons, and what-if explanations. The prompt strictly instructs the LLM: <i>'Use ONLY the numbers provided; never invent metrics; present options as lower-risk simulated alternatives'</i>.", bullet_style))
    story.append(Paragraph("3. <b>Machine Learning Validation:</b> A Scikit-learn Random Forest model trained on 3,000 scenario perturbations achieved <b>MAE = 0.296, RMSE = 0.388, R² = 0.9989</b>, proving the mathematical consistency of the underlying weighted risk model.", bullet_style))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 6: COMPLETE WEBSITE WORKFLOW GUIDE
    # ---------------------------------------------------------
    story.append(Paragraph("6. End-to-End User Experience & Website Workflow", h1_style))
    story.append(Paragraph("When an operator uses the TACTIX AI website, they experience an intuitive 4-stage progressive disclosure workflow:", body_style))

    flow_data = [
        ["Stage", "User Action & Interface Experience", "Underlying System Execution"],
        ["① Describe", "User opens the site, completes or skips the 5-step Guided Tour, types natural-language mission orders or clicks a preset scenario.", "The UI captures the text and dispatches a request to <code>/api/interpret</code> with a local rule-based fallback."],
        ["② Review", "A clean confirmation card appears showing extracted Weather, Resources, Time Limit, and Terrain rules with an <code>[ Edit Scenario ]</code> button.", "User confirms or tweaks variables. The simulator initializes the 1,050-cell environment grid with active weather."],
        ["③ Compare", "Staged loader displays progress. The Tactical Map renders routes alongside three clean option cards: ⚡ Option Alpha, 📦 Option Bravo, and 🌿 Option Charlie.", "A* pathfinding executes 3 objective passes, validates constraints, calculates 6-factor risk, and highlights the preferred alternative."],
        ["④ Explore", "User clicks <code>[ Why? ]</code> buttons to inspect risk drivers, asks the AI Copilot questions, or opens the <b>What-If Lab</b> to drag sliders and compare before/after deltas.", "The simulation engine recalculates routes in real time. The AI Analyst explains why the results shifted."]
    ]
    flow_table = Table(flow_data, colWidths=[70, 210, 224])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('LEADING', (0, 0), (-1, -1), 10.5),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_box]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(flow_table)
    story.append(Spacer(1, 12))

    # Summary Box
    summary_box = """<b>Summary:</b> TACTIX AI bridges the gap between complex GIS spatial science, deterministic simulation algorithms, and accessible human decision-making. By keeping the core simulation deterministic and utilizing AI purely for translation and narrative explanation, the platform delivers zero-latency, highly explainable, and ethically grounded decision support."""
    summary_table = Table([[Paragraph(summary_box, callout_style)]], colWidths=[504])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_box),
        ('BOX', (0, 0), (-1, -1), 1, c_accent),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Successfully generated comprehensive PDF: {filename}")

if __name__ == "__main__":
    build_pdf()
