import { createStyles } from "@mantine/core";

export interface SidebarButtonStyleProps {
  isActive?: boolean;
}

export const useSidebarButtonStyle = createStyles(
  (theme, { isActive = false }: SidebarButtonStyleProps) => {
    const isDark = theme.colorScheme === "dark";

    return {
      root: {
        "backgroundColor": isDark ? theme.colors.dark[6] : "white",
        "borderColor": isActive
          ? theme.fn.primaryColor()
          : isDark
          ? theme.colors.dark[5]
          : theme.colors.gray[3],
        "boxShadow": "none",
        "height": 42,

        "&:hover": {
          backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[1]
        }
      },
      inner: {
        color: isDark ? theme.colors.dark[0] : theme.colors.gray[9],
        fontWeight: "normal",
        justifyContent: "space-between"
      },
      label: {
        paddingLeft: theme.spacing.sm,
        width: "100%",
        textAlign: "start"
      }
    };
  }
);
