const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '../public/data/bird_migration.csv');
const OUTPUT_FILE = path.join(__dirname, '../public/data/migration_lite.json');
const SAMPLING_RATE = 5; // Keep 1 out of every N points (downsampling)

// Helper to parse line
function parseLine(line) {
    const values = line.split(',');
    if (values.length < 9) return null;

    // CSV format: 
    // 0: ?, 1: altitude, 2: date_time, 3: device, 4: direction, 5: lat, 6: lon, 7: speed, 8: name

    const timestamp = new Date(values[2]).getTime();
    if (isNaN(timestamp)) return null;

    return {
        t: timestamp, // time (epoch)
        a: Math.round(parseFloat(values[1]) || 0), // altitude (int)
        y: parseFloat(Number(values[5]).toFixed(4)), // lat
        x: parseFloat(Number(values[6]).toFixed(4)), // lon
        s: parseFloat(Number(values[7]).toFixed(1)), // speed
        n: values[8]?.trim() || 'Unknown' // name
    };
}

// Process
try {
    console.log('Reading CSV...');
    const data = fs.readFileSync(INPUT_FILE, 'utf8');
    const lines = data.trim().split('\n');
    const headers = lines[0];

    console.log(`Total rows: ${lines.length}`);

    // Group by bird
    const birds = {};

    // Start from 1 to skip header
    let processedCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const point = parseLine(lines[i]);
        if (!point) continue;

        // Initialize bird array if needed
        if (!birds[point.n]) {
            birds[point.n] = [];
        }

        // Add point
        birds[point.n].push(point);
        processedCount++;
    }

    console.log(`Parsed ${processedCount} valid points.`);

    // Downsample and simplify
    const optimizedData = {};
    let finalCount = 0;

    Object.keys(birds).forEach(birdName => {
        // Sort by time just in case
        const sortedPoints = birds[birdName].sort((a, b) => a.t - b.t);

        // Downsample
        const sampled = sortedPoints.filter((_, index) => index % SAMPLING_RATE === 0);

        // Store in optimized format
        // simplified object structure: { name: "Eric", points: [[t, a, y, x, s], ...] }
        // array format saves space over array-of-objects

        optimizedData[birdName] = sampled.map(p => [
            p.t, // 0: timestamp
            p.a, // 1: altitude
            p.y, // 2: latitude
            p.x, // 3: longitude
            p.s  // 4: speed
        ]);

        finalCount += sampled.length;
        console.log(`${birdName}: ${sortedPoints.length} -> ${sampled.length} points`);
    });

    // Calculate stats
    const originalSize = fs.statSync(INPUT_FILE).size / 1024 / 1024;

    console.log('Writing JSON...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(optimizedData));

    const newSize = fs.statSync(OUTPUT_FILE).size / 1024 / 1024;

    console.log('--- Summary ---');
    console.log(`Original: ${originalSize.toFixed(2)} MB`);
    console.log(`Optimized: ${newSize.toFixed(2)} MB`);
    console.log(`Reduction: ${((1 - newSize / originalSize) * 100).toFixed(1)}%`);
    console.log(`Total points: ${finalCount}`);
    console.log(`Saved to ${OUTPUT_FILE}`);

} catch (err) {
    console.error('Error processing data:', err);
}
