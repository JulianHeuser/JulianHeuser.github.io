// saveManager is the base class for loading and saving serialized data for my game SubDivide.
// It contains a static variable of type saveData, which stores all information that's saved.
// Anything in the game can access the save data, so it's always up to date without
//		constantly reading/writing from files.

using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO;
using System.Xml.Serialization;
using UnityEngine.SceneManagement;


public class saveData
{
    public string level;
    public int musicSet;
    public int musicSetPart;
    public bool hubPart1Done;
    public bool hubPart2Done;

    public bool gameCompleted;

    public bool DLC_gameCompleted;

    public bool DLC;

    public bool[] DLCParts;
}

public static class saveManager
{
    private static int saveNumber;

    private static string[] saves = { "", "", "" };
    private static string saveInfo;

    private static saveData savedata;

    static saveManager()
    {

        saves[0] = Application.dataPath + "/StreamingAssets/Saves/Save0.xml";
        saves[1] = Application.dataPath + "/StreamingAssets/Saves/Save1.xml";
        saves[2] = Application.dataPath + "/StreamingAssets/Saves/Save2.xml";

        saveInfo = Application.dataPath + "/StreamingAssets/Saves/saveInfo.txt";
        if (File.ReadAllText(saveInfo) == "")
        {
            File.WriteAllText(saveInfo, "0");
            saveNumber = 0;
        }
        else
        {
            saveNumber = int.Parse(File.ReadAllText(saveInfo));
        }

        savedata = new saveData();
        setSaveData();

    }

    public readonly static int DLCSaveSize = 7;

    private static void setSaveData()
    {
        if (File.ReadAllText(saves[saveNumber]) == "")
        {
            savedata.level = "Intro_0";
            savedata.musicSet = 0;
            savedata.musicSetPart = 0;
            savedata.hubPart1Done = false;
            savedata.hubPart2Done = false;
            savedata.gameCompleted = false;
            savedata.DLC_gameCompleted = false;
            savedata.DLC = false;
            savedata.DLCParts = new bool[DLCSaveSize];
            for (int i = 0; i < DLCSaveSize; i++)
            {
                savedata.DLCParts[i] = false;
            }
            saveToXML();
        }
        else
        {
            loadFromXML();
        }
    }

    public static saveData getSaveData(int num)
    {
        saveData data = new saveData();
        if (File.ReadAllText(saves[num]) == "")
        {
            data.level = "Intro_0";
            data.musicSet = 0;
            data.musicSetPart = 0;
            data.hubPart1Done = false;
            data.hubPart2Done = false;
            data.gameCompleted = false;
            data.DLC_gameCompleted = false;
            data.DLC = false;
            data.DLCParts = new bool[DLCSaveSize];
            for (int i = 0; i < DLCSaveSize; i++)
            {
                data.DLCParts[i] = false;
            }
            return data;
        }

        XmlSerializer serializer = new XmlSerializer(typeof(saveData));
        StreamReader reader = new StreamReader(saves[num]);
        data = (saveData)serializer.Deserialize(reader.BaseStream);
        reader.Close();

        return data;
    }

    public static void changeCurrentSave(int saveNum)
    {
        saveNumber = saveNum;
        File.WriteAllText(saveInfo, saveNumber.ToString());
        setSaveData();



        //Destroy EVERYTHING - even stuff set to not destroy on load
        GameObject[] gameObjects = GameObject.FindObjectsOfType<GameObject>();
        for(int i = 0; i< gameObjects.Length; i++)
        {
            if(gameObjects[i].name != "Steamworks")
                GameObject.Destroy(gameObjects[i]);
        }
        HandMovement.level = 1;

        SceneManager.LoadScene(0, LoadSceneMode.Single);
    }


    public static void deleteSave(int saveNum)
    {
        File.WriteAllBytes(saves[saveNum], new byte[0] { });
    }

    public static int getSaveNum()
    {
        return saveNumber;
    }

    //Saving
    public static void setLevel(string value)
    {
        savedata.level = value;
    }
    public static void setMusicSet(int value)
    {
        savedata.musicSet = value;
    }
    public static void setMusicSetPart(int value)
    {
        savedata.musicSetPart = value;
    }
    public static void setHubProgress(int part, bool isDone)
    {

        //handle saving DLC progress
        if (getDLC())
        {
            savedata.DLCParts[part] = true;
            return;
        }


        //handle saving normal (non-dlc) progress
        if (part == 0)
        {
            savedata.hubPart1Done = isDone;
        }
        else
        {
            savedata.hubPart2Done = isDone;
        }
    }
    public static void setComplete()
    {
        savedata.gameCompleted = true;
    }
    public static void setDLCComplete()
    {
        savedata.DLC_gameCompleted = true;
    }
    public static void setDLC(bool b = true)
    {
        savedata.DLC = b;
        savedata.hubPart1Done = false;
        savedata.hubPart2Done = false;

        savedata.DLCParts = new bool[DLCSaveSize];
        for (int i = 0; i < DLCSaveSize; i++)
        {
            savedata.DLCParts[i] = false;
        }
        saveToXML();
    }

    //Getting Data
    public static string getLevel()
    {
        return savedata.level;
    }
    public static int getMusicSet()
    {
        return savedata.musicSet;
    }
    public static int getMusicSetPart()
    {
        return savedata.musicSetPart;
    }
    public static bool getHubProgress(int part)
    {   
        //handle getting DLC progress
        if (getDLC())
        {
            return savedata.DLCParts[part];
        }

        if (part == 0)
        {
            return savedata.hubPart1Done;
        }
        else
        {
            return savedata.hubPart2Done;
        }
    }
    public static bool isComplete()
    {
        return savedata.gameCompleted;
    }
    public static bool isDLCComplete()
    {
        return savedata.DLC_gameCompleted;
    }

    public static bool isSaveEmpty(int saveNum)
    {
        return (File.ReadAllText(saves[saveNum]) == "");
    }
    public static bool getDLC()
    {
        return savedata.DLC;
    }
	
    //Serialization and deserialization
    public static void saveToXML()
    {
        XmlSerializer serializer = new XmlSerializer(typeof(saveData));
        StreamWriter writer = new StreamWriter(saves[saveNumber]);
        serializer.Serialize(writer.BaseStream, savedata);
        writer.Close();
    }

    public static void loadFromXML()
    {
        XmlSerializer serializer = new XmlSerializer(typeof(saveData));
        StreamReader reader = new StreamReader(saves[saveNumber]);
        savedata = (saveData)serializer.Deserialize(reader.BaseStream);
        reader.Close();
    }
}