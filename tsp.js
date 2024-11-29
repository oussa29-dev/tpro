function measureExecutionTime(callback, ...args) {
    const start = performance.now();
    const result = callback(...args);
    const end = performance.now();
    return { result, time: end - start };
}

function generateMatrix() {
    const size = parseInt(document.getElementById("matrix-size").value);
    if (isNaN(size) || size < 2) {
        alert("Veuillez entrer un nombre valide (≥ 2).");
        return;
    }

    const matrixInput = document.getElementById("matrix-input");
    matrixInput.innerHTML = ""; // Reset previous inputs

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.value = i === j ? "0" : ""; // Diagonale = 0
            input.id = `matrix-${i}-${j}`;
            input.placeholder = `${i},${j}`;
            matrixInput.appendChild(input);
        }
    }
}

function readMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            const value = parseFloat(document.getElementById(`matrix-${i}-${j}`).value);
            if (isNaN(value)) {
                alert("Veuillez remplir toutes les distances.");
                return null;
            }
            matrix[i][j] = value;
        }
    }
    return matrix;
}

function nearestNeighbor(distanceMatrix, start = 0) {
    const n = distanceMatrix.length;
    const visited = new Array(n).fill(false);
    const path = [start];
    let currentCity = start;
    visited[start] = true;
    let totalCost = 0;

    for (let step = 0; step < n - 1; step++) {
        let nextCity = -1;
        let minDistance = Infinity;

        for (let j = 0; j < n; j++) {
            if (!visited[j] && distanceMatrix[currentCity][j] < minDistance) {
                nextCity = j;
                minDistance = distanceMatrix[currentCity][j];
            }
        }

        path.push(nextCity);
        visited[nextCity] = true;
        totalCost += minDistance;
        currentCity = nextCity;
    }

    totalCost += distanceMatrix[currentCity][start];
    path.push(start);

    return { path, totalCost };
}

function bruteForceTSP(distanceMatrix, start = 0) {
    const n = distanceMatrix.length;

    function permutations(arr) {
        if (arr.length === 0) return [[]];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const perms = permutations(remaining);
            for (const perm of perms) {
                result.push([current, ...perm]);
            }
        }
        return result;
    }

    const cities = Array.from({ length: n }, (_, i) => i).filter(city => city !== start);
    const allPermutations = permutations(cities);

    let minCost = Infinity;
    let bestPath = null;

    for (const perm of allPermutations) {
        let currentCost = 0;
        let currentPath = [start, ...perm, start];
        for (let i = 0; i < currentPath.length - 1; i++) {
            currentCost += distanceMatrix[currentPath[i]][currentPath[i + 1]];
        }

        if (currentCost < minCost) {
            minCost = currentCost;
            bestPath = currentPath;
        }
    }

    return { path: bestPath, totalCost: minCost };
}

function solveTSP() {
    const size = parseInt(document.getElementById("matrix-size").value);
    const startCity = parseInt(document.getElementById("start-city").value);

    if (isNaN(size) || size < 2) {
        alert("Veuillez entrer un nombre valide (≥ 2).");
        return;
    }

    if (isNaN(startCity) || startCity < 0 || startCity >= size) {
        alert(`Veuillez entrer une ville de départ valide (entre 0 et ${size - 1}).`);
        return;
    }

    const distanceMatrix = readMatrix(size);
    if (!distanceMatrix) return;

    // Measure execution time for heuristic
    const heuristicTiming = measureExecutionTime(nearestNeighbor, distanceMatrix, startCity);
    const heuristicResult = heuristicTiming.result;

    // Measure execution time for brute force
    const exactTiming = measureExecutionTime(bruteForceTSP, distanceMatrix, startCity);
    const exactResult = exactTiming.result;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <h2>Résultats</h2>
        <table>
            <tr>
                <th>Méthode</th>
                <th>Cycle</th>
                <th>Coût</th>
                <th>Temps d'exécution (ms)</th>
            </tr>
            <tr>
                <td>Heuristique</td>
                <td>${heuristicResult.path.join(" → ")}</td>
                <td>${heuristicResult.totalCost}</td>
                <td>${heuristicTiming.time.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Exacte</td>
                <td>${exactResult.path.join(" → ")}</td>
                <td>${exactResult.totalCost}</td>
                <td>${exactTiming.time.toFixed(2)}</td>
            </tr>
        </table>
    `;
}
