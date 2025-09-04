import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ImageBackground, StyleSheet, TouchableOpacity } from "react-native"; // Added ImageBackground for background image
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";

export default function Index() {
  const [playerChoice, setPlayerChoice] = useState("");
  const [computerChoice, setComputerChoice] = useState("");
  const [result, setResult] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const choices = ["rock", "paper", "scissors"] as const;
  const choiceImages: Record<typeof choices[number], any> = {
    rock: require("../../assets/images/rock.png"),
    paper: require("../../assets/images/paper.png"),
    scissors: require("../../assets/images/scissors.png"),
  };

  // Animations
  const rockScale = useSharedValue(1);
  const paperScale = useSharedValue(1);
  const scissorsScale = useSharedValue(1);

  const resultScale = useSharedValue(1);
  const resultShake = useSharedValue(0);
  const resultOpacity = useSharedValue(1);

  const playGame = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // bounce animation for pressed choice
    const target =
      choice === "rock" ? rockScale :
      choice === "paper" ? paperScale :
      scissorsScale;

    target.value = withSequence(withSpring(1.2), withSpring(1));

    const compChoice = getComputerChoice();
    const gameResult = getResult(choice, compChoice);

    setPlayerChoice(choice);
    setComputerChoice(compChoice);
    setResult(gameResult);

    // reset
    resultScale.value = 1;
    resultShake.value = 0;
    resultOpacity.value = 1;

    if (gameResult === "You Win!") {
      resultScale.value = 0.5; // start smaller
      resultScale.value = withSpring(1, { damping: 6 }); // bounce in
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } else if (gameResult === "You Lose!") {
      resultShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } else {
      resultOpacity.value = 0.8; // Start at 0.8 for better visibility
      resultOpacity.value = withTiming(1, { duration: 1000 }); // Longer duration
    }
  };

  // choice animations
  const rockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rockScale.value }],
  }));
  const paperAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: paperScale.value }],
  }));
  const scissorsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scissorsScale.value }],
  }));

  // result animations
  const resultAnimatedStyle = useAnimatedStyle(() => {
    if (result === "You Win!") {
      return {
        transform: [{ scale: resultScale.value }],
        opacity: 1,
      };
    } else if (result === "You Lose!") {
      return {
        transform: [{ translateX: resultShake.value }],
        opacity: 1,
      };
    } else if (result === "Draw") {
      return {
        opacity: resultOpacity.value,
      };
    }
    return { opacity: 1 };
  });

  return (
    // Using ImageBackground to set background.png as the app's background image
    <ImageBackground source={require("../../assets/images/background.png")} style={styles.container}>
      <ThemedText style={styles.title} type="title">
        Rock Paper Scissors
      </ThemedText>

      <ThemedView style={styles.choicesContainer}>
        {choices.map((choice) => (
          <TouchableOpacity
            key={choice}
            onPress={() => playGame(choice)}
            style={{ alignItems: "center" }}
          >
            <Animated.Image
              source={choiceImages[choice]}
              style={[
                choice === "rock" ? styles.rockImage :
                choice === "paper" ? styles.paperImage :
                choice === "scissors" ? styles.scissorsImage : styles.choiceImage,
                choice === "rock"
                  ? rockAnimatedStyle
                  : choice === "paper"
                  ? paperAnimatedStyle
                  : scissorsAnimatedStyle,
              ]}
            />
            <ThemedText style={styles.choiceLabel}>
              {choice.charAt(0).toUpperCase() + choice.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {result ? (
        <ThemedView style={styles.resultContainer}>
          <ThemedText>Your choice: {playerChoice}</ThemedText>
          <ThemedText>Computer choice: {computerChoice}</ThemedText>
          <Animated.Text style={[styles.resultText, resultAnimatedStyle]}>
            {result}
          </Animated.Text>
        </ThemedView>
      ) : null}

      {showConfetti && (
        <ConfettiCannon count={50} origin={{ x: 200, y: -10 }} fadeOut={true} />
      )}
    </ImageBackground>
  );
}

function getComputerChoice() {
  const choices = ["rock", "paper", "scissors"];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

function getResult(playerChoice: string, computerChoice: string) {
  if (playerChoice === computerChoice) return "Draw";
  if (
    (playerChoice === "rock" && computerChoice === "scissors") ||
    (playerChoice === "paper" && computerChoice === "rock") ||
    (playerChoice === "scissors" && computerChoice === "paper")
  )
    return "You Win!";
  return "You Lose!";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#FF69B4",
    textShadowColor: "#800080",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  choicesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(24, 7, 7, 0.3)',
    marginLeft: 50,
  },
  choiceImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderWidth: 3,
    borderColor: "#FF69B4",
    borderRadius: 10,
  },
  rockImage: {
    width: 100,
    height: 100,
    margin: 15,
    marginLeft: 30,
    borderWidth: 3,
    borderColor: "green",
    borderRadius: 10,
  },
  paperImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderWidth: 3,
    borderColor: "blue",
    borderRadius: 10,
  },
  scissorsImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderWidth: 3,
    borderColor: "orange",
    borderRadius: 10,
  },
  choiceLabel: {
    textAlign: "center",
    color: "#FF69B4",
    fontWeight: "bold",
    marginTop: 5,
    fontSize: 16,
  },
  resultContainer: {
    alignItems: "center",
    marginTop: 30,
    padding: 20,
    backgroundColor: "#800080",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FF69B4",
    marginLeft: 50,
  },
  resultText: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#FF69B4",
    textShadowColor: "#800080",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5, // Increased for glow effect
  },
});
